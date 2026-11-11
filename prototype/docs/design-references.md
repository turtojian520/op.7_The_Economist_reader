# 视觉参考与设计决策

本次选取用户给定集合中与阅读工具相关的平台进行查阅；参考截图保存在本目录 `references/`。采用自有产品名“旁读 Margin”，没有模拟《经济学人》官方界面或复制某个获奖站整页。

| 实际查阅 | 提取的设计线索 | 在原型里的落实 |
|---|---|---|
| [Siteinspire / Typographic](https://www.siteinspire.com/websites/category/typographic) | 类型筛选、文字与网格层级；列表可见 David McGillivray、The Future In Black 等案例 | 英文衬线标题与正文，中文工具栏使用无衬线；文字和来源主导层级 |
| [Awwwards / Typography](https://www.awwwards.com/websites/typography/) | 标题尺度与图文对照；列表可见 Traced、Baseline Studio 等案例 | 首页用真实选文配原刊图，清晰主次；阅读页不加大幅营销区 |
| [Minimal Gallery](https://minimal.gallery/) | 少量控件、克制的筛选入口和内容密度 | 四项主导航、细分隔线、单一深绿操作色；移除空泛数据卡与炫光 |
| [Lapa Ninja](https://www.lapa.ninja/) | 纵向内容顺序及整体页面节奏 | 先选文、再期刊、最后文章目录；让用户直接进入内容 |
| [Navbar Gallery / Static](https://www.navbar.gallery/type/static) | 静态导航样本与明确活动态 | 顶部导航细下划线、位置稳定；手机重排为第二行，保留四个入口 |
| [Codrops](https://tympanus.net/codrops/) | 编辑式文章排列与交互案例索引 | 以正文为重心，动画仅用于加载/状态反馈；本轮未复制其教程代码 |
| [React Bits](https://reactbits.dev/) | 可调参数与状态展示的交互思路 | 阅读字号与练习模式可直接切换；没有引入其背景/装饰动画依赖 |

Godly、Animate UI、Hover.css 在本次访问中超时或连接关闭，未把它们写成已经完成的视觉依据。其余集合网站不在本轮必选范围：定价、客户证明、发光效果、巨型页脚或粗野主义与当前精读任务关联较弱。未声称逐一审阅全部 26 个集合。

## 统一系统

- 字色为偏绿墨色，纸面为低饱和浅灰米色。深绿用于主要操作和当前状态；高亮使用淡黄。
- 阅读正文 Georgia；中文标题 Songti，工具栏 Helvetica Neue / PingFang。均走 CSS tokens，使用设备本地字体。
- 首页是期刊内容目录，阅读页是正文与手边栏，练习页是原句与作答纸面，签核页是左右对照；四页共享导航、按钮与边界样式。
- 信息型标题保留正常断行；动作标签短且单行。来源元数据后置，减少“标签 + 口号”的重复。
- 弱动效只用于 hover、点击和加载；提供 reduced-motion 回退、即时焦点样式、窄屏底部辅助面板。

## Hallmark 优化

根据用户要求在第一版之后使用 [Nutlope/hallmark](https://github.com/Nutlope/hallmark)，读取其 SKILL 与 app-screen/polish 规约并运行 sloplint，不以更换业务功能来迎合营销模板。

固定提交：`407fa689f4a276f2fd389208d271d0fef08f5058`。

实际修复：去掉冗余眉题；长文标题改用内容导航语义；调整标题与元数据间距；修复输入框边缘对比度；提高过小的辅助文字；统一颜色与字体 tokens；去掉移动浮层边框与阴影的叠加；增加键盘焦点、Esc 关闭和 reduced-motion。

保留的例外：期刊封面和相关文章条目可整块点击，其高度大于短按钮。此取舍记录于 CSS Hallmark 39b waiver。偏离 4px 网格的间距为 polish 模式的非阻断 NOTE，保留当前排版。

最终机器检查见 `../qa/hallmark-final.txt`，人工审阅在当前聊天完成，没有声称使用了独立审阅 agent。原型中所有阅读插图来自本地原刊，不是为了装饰生成的占位画。
