#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_DIR="$PROJECT_DIR/server/runtime"
BREW_PREFIX="$(brew --prefix)"
DB_SOCKET="/tmp/margin-$(printf %s "$PROJECT_DIR/server" | shasum -a 256 | cut -c1-12).sock"
if curl --silent --fail --max-time 2 http://127.0.0.1:8097/api/health >/dev/null 2>&1; then
 printf 'Margin is already running at http://127.0.0.1:8097\n'
 exit 0
fi
if lsof -nP -iTCP:8097 -sTCP:LISTEN >/dev/null 2>&1 || lsof -nP -iTCP:9077 -sTCP:LISTEN >/dev/null 2>&1; then
 printf 'Ports 8097 or 9077 are occupied; stop the conflicting process first.\n' >&2
 exit 1
fi
mkdir -p "$RUNTIME_DIR/db"
if [[ ! -d "$PROJECT_DIR/dist" ]]; then (cd "$PROJECT_DIR" && npm run build); fi
if [[ ! -d "$RUNTIME_DIR/db/mysql" ]]; then
 "$BREW_PREFIX/opt/mariadb/bin/mariadb-install-db" --no-defaults --datadir="$RUNTIME_DIR/db" --auth-root-authentication-method=normal > "$RUNTIME_DIR/db-init.log" 2>&1
fi
cat > "$RUNTIME_DIR/php-fpm.conf" <<EOF
[global]
pid = $RUNTIME_DIR/php-fpm.pid
error_log = $RUNTIME_DIR/php-fpm.log
daemonize = no
[margin]
listen = 127.0.0.1:9077
listen.allowed_clients = 127.0.0.1
pm = ondemand
pm.max_children = 4
pm.process_idle_timeout = 10s
catch_workers_output = yes
EOF
cat > "$RUNTIME_DIR/httpd.conf" <<EOF
ServerRoot "$BREW_PREFIX/opt/httpd"
Listen 127.0.0.1:8097
ServerName localhost
PidFile "$RUNTIME_DIR/httpd.pid"
LoadModule mpm_event_module lib/httpd/modules/mod_mpm_event.so
LoadModule authz_core_module lib/httpd/modules/mod_authz_core.so
LoadModule authz_host_module lib/httpd/modules/mod_authz_host.so
LoadModule unixd_module lib/httpd/modules/mod_unixd.so
LoadModule dir_module lib/httpd/modules/mod_dir.so
LoadModule mime_module lib/httpd/modules/mod_mime.so
LoadModule alias_module lib/httpd/modules/mod_alias.so
LoadModule proxy_module lib/httpd/modules/mod_proxy.so
LoadModule proxy_fcgi_module lib/httpd/modules/mod_proxy_fcgi.so
LoadModule log_config_module lib/httpd/modules/mod_log_config.so
TypesConfig "$BREW_PREFIX/etc/httpd/mime.types"
ErrorLog "$RUNTIME_DIR/httpd-error.log"
LogFormat "%h %l %u %t %r %>s %b" margin
CustomLog "$RUNTIME_DIR/httpd-access.log" margin
DocumentRoot "$PROJECT_DIR/dist"
DirectoryIndex index.html
<Directory />
 Require all denied
</Directory>
<Directory "$PROJECT_DIR/dist">
 Require local
 Options -Indexes
 AllowOverride None
</Directory>
AliasMatch "^/api(?:/.*)?$" "$PROJECT_DIR/server/index.php"
<Directory "$PROJECT_DIR/server">
 Require local
 Options -Indexes
 <FilesMatch "\\.php$">
  SetHandler "proxy:fcgi://127.0.0.1:9077"
 </FilesMatch>
</Directory>
EOF
# Homebrew module locations differ between versions; resolve the installed libexec directory.
MODULE_DIR="$BREW_PREFIX/opt/httpd/lib/httpd/modules"
if [[ ! -f "$MODULE_DIR/mod_mpm_event.so" ]]; then MODULE_DIR="$BREW_PREFIX/opt/httpd/libexec"; fi
python3 - "$RUNTIME_DIR/httpd.conf" "$MODULE_DIR" <<'PY'
import sys
p=sys.argv[1]
s=open(p).read().replace('lib/httpd/modules/',sys.argv[2]+'/')
open(p,'w').write(s)
PY
"$BREW_PREFIX/opt/httpd/bin/httpd" -t -f "$RUNTIME_DIR/httpd.conf"
pids=()
cleanup(){ for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM
"$BREW_PREFIX/opt/mariadb/bin/mariadbd" --no-defaults --datadir="$RUNTIME_DIR/db" --socket="$DB_SOCKET" --pid-file="$RUNTIME_DIR/mysql.pid" --skip-networking --log-error="$RUNTIME_DIR/mariadb.log" & pids+=("$!")
for n in {1..100}; do if "$BREW_PREFIX/opt/mariadb/bin/mariadb-admin" --no-defaults --socket="$DB_SOCKET" -u root ping >/dev/null 2>&1; then break; fi; sleep .1; done
"$BREW_PREFIX/opt/mariadb/bin/mariadb" --no-defaults --socket="$DB_SOCKET" -u root -e 'CREATE DATABASE IF NOT EXISTS margin_reader CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
"$BREW_PREFIX/opt/php/sbin/php-fpm" -F -y "$RUNTIME_DIR/php-fpm.conf" & pids+=("$!")
"$BREW_PREFIX/opt/httpd/bin/httpd" -D FOREGROUND -f "$RUNTIME_DIR/httpd.conf" & pids+=("$!")
printf '\nMargin is running at http://127.0.0.1:8097\nApache + PHP-FPM + MariaDB, isolated project data. Ctrl+C to stop.\n'
wait
