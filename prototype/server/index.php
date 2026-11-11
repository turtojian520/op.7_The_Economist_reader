<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(mixed $data,int $code=200):never {http_response_code($code);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function fail(string $message,int $code=400):never {reply(['error'=>$message],$code);}
try {
$catalog=json_decode(file_get_contents(__DIR__.'/data/catalog.json'),true,512,JSON_THROW_ON_ERROR);
$articles=array_column($catalog['articles'],null,'id');
$path=preg_replace('#^/api#','',parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
$method=$_SERVER['REQUEST_METHOD'];
$input=[];
if($method==='POST'){
 if(!str_starts_with($_SERVER['CONTENT_TYPE']??'','application/json'))fail('需要 JSON 请求',415);
 $origin=$_SERVER['HTTP_ORIGIN']??'';
 if($origin&&!in_array($origin,['http://127.0.0.1:5177','http://localhost:5177','http://127.0.0.1:8097','http://localhost:8097'],true))fail('仅接受本地阅读室的请求',403);
 $raw=file_get_contents('php://input');if(strlen($raw)>100000)fail('内容过长',413);
 $input=json_decode($raw,true,32,JSON_THROW_ON_ERROR);if(!is_array($input))fail('无效请求');
}
function textField(array $data,string $key,int $max=5000,bool $required=false):string {$v=$data[$key]??'';if(!is_string($v)||mb_strlen($v)>$max)fail('字段无效：'.$key);if($required&&!trim($v))fail('请填写'.$key);return trim($v);}
function contextFor(array $data):array {global $articles;$id=textField($data,'articleId',80,true);$pId=textField($data,'paragraphId',20,true);$a=$articles[$id]??null;if(!$a)fail('文章不存在',404);$p=null;foreach($a['paragraphs'] as $candidate)if($candidate['id']===$pId)$p=$candidate;if(!$p)fail('原文段落不存在',404);$quote=textField($data,'text',4000);if(!$quote)$quote=textField($data,'quote',4000);if(!$quote||!str_contains($p['text'],$quote))fail('选区与原文不匹配，请重新选择');return [$a,$p,$quote];}
$socket=getenv('MARGIN_DB_SOCKET')?:'/tmp/margin-'.substr(hash('sha256',__DIR__),0,12).'.sock';
$db=new PDO('mysql:unix_socket='.$socket.';dbname=margin_reader;charset=utf8mb4','root','',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
$db->exec('CREATE TABLE IF NOT EXISTS records (kind VARCHAR(24) NOT NULL,id VARCHAR(100) NOT NULL,data LONGTEXT NOT NULL, PRIMARY KEY(kind,id)) ENGINE=InnoDB');
function allRecords(string $kind):array {global $db;$q=$db->prepare('SELECT data FROM records WHERE kind=?');$q->execute([$kind]);return array_map(fn($r)=>json_decode($r['data'],true),$q->fetchAll());}
function record(string $kind,string $id,bool $lock=false):?array {global $db;$q=$db->prepare('SELECT data FROM records WHERE kind=? AND id=?'.($lock?' FOR UPDATE':''));$q->execute([$kind,$id]);$r=$q->fetch();return $r?json_decode($r['data'],true):null;}
function put(string $kind,array $data):array {global $db;$q=$db->prepare('INSERT INTO records(kind,id,data) VALUES(?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)');$q->execute([$kind,$data['id'],json_encode($data,JSON_UNESCAPED_UNICODE)]);return $data;}
function newId():string{return bin2hex(random_bytes(12));}
function state():array {$s=[];foreach(['notes','drafts','vocabulary','attempts','reading'] as $key)$s[$key]=allRecords($key);usort($s['notes'],fn($a,$b)=>strcmp($b['createdAt'],$a['createdAt']));usort($s['reading'],fn($a,$b)=>strcmp($b['updatedAt'],$a['updatedAt']));return $s;}
if($method==='GET'&&$path==='/health')reply(['ok'=>true,'backend'=>'Apache + PHP-FPM + MariaDB','scope'=>'local single user']);
if($method==='GET'&&$path==='/catalog'){$c=$catalog;$c['articles']=array_map(function($a){unset($a['paragraphs'],$a['sourceFile']);return $a;},$c['articles']);foreach($c['issues'] as &$i)unset($i['source']);reply($c);}
if($method==='GET'&&preg_match('#^/article/([\w-]+)$#',$path,$m))reply($articles[$m[1]]??['error'=>'文章不存在'],isset($articles[$m[1]])?200:404);
if($method==='GET'&&$path==='/state')reply(state());
if($method==='GET'&&$path==='/export')reply(['exportedAt'=>date(DATE_ATOM),'product'=>'Margin local prototype','state'=>state(),'history'=>allRecords('decisions')]);
if($method==='POST'&&$path==='/lookup'){
 [$a,$p,$quote]=contextFor($input);$dict=json_decode(file_get_contents(__DIR__.'/data/dictionary.json'),true);
 $key=strtolower(trim($quote," \n\r\t.,;:!?\"“”()"));$entry=$dict[$key]??null;
 if(!$entry&&strlen($quote)>70&&$a['id']===$catalog['featuredId']){
 $translations=json_decode(file_get_contents(__DIR__.'/data/translations.json'),true);
 $entry=$translations[$p['id']]??null;
 if($entry)$entry['meaning']='本段语境译解';
 }
 reply(array_merge(['context'=>$p['text'],'available'=>(bool)$entry],$entry??[]));
}
if($method==='POST'&&$path==='/reading'){
 $id=textField($input,'articleId',80,true);if(!isset($articles[$id]))fail('文章不存在',404);
 $status=$input['status']??'reading';if(!in_array($status,['reading','completed'],true))fail('阅读状态无效');
 reply(put('reading',['id'=>$id,'articleId'=>$id,'status'=>$status,'updatedAt'=>date(DATE_ATOM)]));
}
if($method==='POST'&&$path==='/notes'){
 $ctx=$input;$ctx['text']=$input['quote']??'';
 [$a,$p,$quote]=contextFor($ctx);
 $kind=$input['kind']??'note';if(!in_array($kind,['note','highlight'],true))fail('不能直接创建已确认笔记',403);
 $body=textField($input,'noteText',5000,$kind==='note');
 reply(put('notes',['id'=>newId(),'articleId'=>$a['id'],'articleTitle'=>$a['title'],'issueId'=>$a['issueId'],'paragraphId'=>$p['id'],'quote'=>$quote,'text'=>$body,'tag'=>textField($input,'tag',80),'kind'=>$kind,'author'=>'user','createdAt'=>date(DATE_ATOM)]),201);
}
if($method==='POST'&&$path==='/vocabulary'){
 [$a,$p,$quote]=contextFor($input);if(!preg_match('/^[A-Za-z][A-Za-z’\x27 -]{0,65}$/u',$quote)||count(explode(' ',$quote))>5)fail('请选择英文单词或短语');
 $id=hash('sha256',strtolower($quote).'|'.$a['id'].'|'.$p['id']);$old=record('vocabulary',$id);if($old)reply($old);
 reply(put('vocabulary',['id'=>$id,'word'=>$quote,'meaning'=>textField($input,'meaning',500),'phonetic'=>textField($input,'phonetic',100),'articleId'=>$a['id'],'articleTitle'=>$a['title'],'issueId'=>$a['issueId'],'paragraphId'=>$p['id'],'context'=>$p['text'],'createdAt'=>date(DATE_ATOM),'dueAt'=>date('Y-m-d')]),201);
}
if($method==='POST'&&$path==='/attempts'){
 $v=record('vocabulary',textField($input,'vocabularyId',100,true));if(!$v)fail('词条不存在',404);
 $answer=textField($input,'answer',100,true);$mode=$input['mode']??'';if(!in_array($mode,['cloze','meaning','copy'],true))fail('练习模式无效');
 $revealed=(bool)($input['revealed']??false);
 $correct=mb_strtolower($answer)===mb_strtolower($v['word']);$assisted=$revealed||($input['hinted']??false)||($input['pasted']??false)||$mode==='copy';
 $group=textField($input,'group',100,true);$previous=array_filter(allRecords('attempts'),fn($r)=>($r['group']??null)===$group&&$r['vocabularyId']===$v['id']);
 $first=count($previous)===0;$firstCorrect=$first&&$correct&&!$assisted;
 $attempt=['id'=>newId(),'vocabularyId'=>$v['id'],'answer'=>$answer,'correct'=>$correct,'assisted'=>$assisted,'revealed'=>$revealed,'first'=>$first,'firstCorrect'=>$firstCorrect,'mode'=>$mode,'group'=>$group,'createdAt'=>date(DATE_ATOM)];
 $db->beginTransaction();put('attempts',$attempt);$v['dueAt']=date('Y-m-d',strtotime($firstCorrect?'+1 day':'tomorrow'));put('vocabulary',$v);$db->commit();reply($attempt,201);
}
if($method==='POST'&&$path==='/drafts'){
 $n=record('notes',textField($input,'noteId',100,true));if(!$n||$n['kind']==='reviewed')fail('请选择一条原始笔记');
 foreach(allRecords('drafts') as $old)if($old['noteId']===$n['id']&&$old['status']==='pending')reply($old);
 reply(put('drafts',['id'=>newId(),'noteId'=>$n['id'],'originalText'=>$n['text'],'quote'=>$n['quote'],'articleId'=>$n['articleId'],'articleTitle'=>$n['articleTitle'],'paragraphId'=>$n['paragraphId'],'issueId'=>$n['issueId'],'text'=>'我对这段内容的理解或疑问是：'.$n['text']."
接下来需要结合原句，继续核对这个判断。",'version'=>1,'status'=>'pending','provider'=>'local-template','createdAt'=>date(DATE_ATOM)]),201);
}
if($method==='POST'&&preg_match('#^/drafts/([a-f0-9]+)/decision$#',$path,$m)){
 $db->beginTransaction();$d=record('drafts',$m[1],true);if(!$d)fail('草稿不存在',404);
 if(($input['version']??null)!==$d['version'])fail('草稿版本已变化，请刷新重新审阅',409);
 $decision=$input['decision']??'';if(!in_array($decision,['accept','reject','revoke'],true))fail('签核操作无效');
 if($decision==='revoke'){
 if($d['status']!=='accepted')fail('该草稿当前未被采纳',409);
 $q=$db->prepare('DELETE FROM records WHERE kind=? AND id=?');$q->execute(['notes','reviewed-'.$d['id']]);$d['status']='revoked';
 }else{
 if($d['status']!=='pending')fail('该草稿已处理，请刷新',409);
 if($decision==='accept'){
 $text=textField($input,'text',6000,true);
 put('notes',['id'=>'reviewed-'.$d['id'],'articleId'=>$d['articleId'],'articleTitle'=>$d['articleTitle'],'paragraphId'=>$d['paragraphId'],'issueId'=>$d['issueId'],'quote'=>$d['quote'],'text'=>$text,'kind'=>'reviewed','author'=>'user-confirmed-ai','originalNoteId'=>$d['noteId'],'draftId'=>$d['id'],'draftVersion'=>$d['version'],'originalDraft'=>$d['text'],'edited'=>$text!==$d['text'],'createdAt'=>date(DATE_ATOM)]);$d['status']='accepted';
 }else $d['status']='rejected';
 }
 put('drafts',$d);put('decisions',['id'=>newId(),'draftId'=>$d['id'],'version'=>$d['version'],'decision'=>$decision,'text'=>$input['text']??null,'actor'=>'local-user','createdAt'=>date(DATE_ATOM)]);$db->commit();reply($d);
}
fail('接口不存在',404);
} catch(Throwable $e){if(isset($db)&&$db->inTransaction())$db->rollBack();error_log((string)$e);reply(['error'=>'本地服务暂时不可用，请检查 Apache、PHP 和数据库进程。'],500);}
