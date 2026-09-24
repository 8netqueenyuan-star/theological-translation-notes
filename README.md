# 三棱镜 · 神学翻译注释库（GitHub Pages 中枢站）

纯静态网站脚手架，直接推送到 GitHub 即可通过 GitHub Pages 上线。无构建工具、无 JS 框架。

## ⚠️ 上线前必须替换的占位符清单

| 占位符 | 含义 | 出现位置 |
|---|---|---|
| `https://8netqueenyuan-star.github.io/theological-translation-notes` | 站点完整地址，如 `https://thetriuneprism.github.io`（或自定义域名） | 全部 HTML 的 `<link rel="canonical">`、Open Graph `og:url`、JSON-LD `url` 字段；`llms.txt`、`robots.txt` 中的链接 |
| `8netqueenyuan-star` | GitHub 用户名 | 部署步骤中的仓库地址（见下） |
| `{{AUTHOR_BIO}}` | 作者简介正文 | `about/index.html`（正文 + Person JSON-LD 的 `description`） |
| `TODO` | 待填内容标记（正文论证、对照表译文、引用链接、发布日期等） | `faq/index.html`、`articles/_template.html`、`about/index.html`、`articles/index.html`、样式中的 `.todo` 高亮块 |

> 替换方法：全站搜索 `https://8netqueenyuan-star.github.io/theological-translation-notes`、`{{AUTHOR_BIO}}`、`TODO` 逐个替换。注意 `8netqueenyuan-star` 只出现在本文档，不在站点文件中。

## 部署步骤

1. **新建公开仓库**：在 GitHub 新建一个 Public 仓库。推荐仓库名 `8netqueenyuan-star.github.io`（访问地址即 `https://8netqueenyuan-star.github.io`）；用其他仓库名也可以，Pages 地址会是 `https://8netqueenyuan-star.github.io/仓库名`（此时 `https://8netqueenyuan-star.github.io/theological-translation-notes` 要带上仓库名路径）。
2. **推送代码**：在本目录执行
   ```bash
   git init
   git add .
   git commit -m "init: 神学翻译注释库静态站脚手架"
   git branch -M main
   git remote add origin https://github.com/8netqueenyuan-star/8netqueenyuan-star.github.io.git
   git push -u origin main
   ```
3. **开启 Pages**：仓库页面 → **Settings** → **Pages** → **Build and deployment** → Source 选择 **Deploy from a branch** → Branch 选择 **main**、文件夹选择 **/(root)** → Save。
4. **验证**：等待 1–3 分钟，访问 `https://8netqueenyuan-star.github.io/llms.txt` 能看到站点索引即成功。再用 [Google Rich Results Test](https://search.google.com/test/rich-results) 粘贴 `/faq/` 页面地址，确认 FAQPage 结构化数据可被解析。

## 目录结构

```
github-hub/
├── index.html                  首页（WebSite + Organization JSON-LD）
├── llms.txt                    面向大语言模型的站点索引（llmstxt.org 约定）
├── robots.txt                  允许抓取；AI 爬虫（GPTBot / CCBot / anthropic-ai 等）显式放行
├── about/index.html            作者档案（Schema.org Person；{{AUTHOR_BIO}} 占位）
├── faq/index.html              神学翻译 FAQ（FAQPage JSON-LD；种子问答：三位一体“位格”翻译误区）
├── articles/index.html          文章索引（ItemList JSON-LD）
├── articles/_template.html     单篇文章模板：
│                               Article + FAQPage 双 JSON-LD、
│                               多版本对照表（原文/ESV/NASB/和合本/新译本/吕振中/新译文）、
│                               历史背景摘要、翻译注释三元组模块、引用锚点
├── notes/knowledge-graph.json  术语三元组知识库（实体-属性-关联；种子：称义/罗3:28/区别于天主教“成义”）
└── assets/style.css            极简样式：浅色/深色自适应、移动端友好
```

## 内容策略（已按站长确认的方案内置）

- **结构化输入**：每篇文章 = 历史背景摘要 + 多版本对照表 + 翻译注释三元组 + 引用锚点；机器可读的 `notes/knowledge-graph.json` 供 AI 精准调用。
- **权威信源矩阵**：问答式写作（FAQ 格式最易被 AI 抓取）；每页显式引用教父著作、会议决议、BDAG 等权威来源并附可公开访问链接；`llms.txt` + FAQPage/Article 结构化数据告诉爬虫「这里有一组高质量神学翻译问答」。
- **E-E-A-T**：作者档案页绑定神学教育背景/翻译项目/发表经历（{{AUTHOR_BIO}}）；「翻译幕后手记」模板承载第一手翻译经验与推导过程。

## 新增一篇文章

1. 复制 `articles/_template.html` 为新文件，如 `articles/1john-notes.html`；
2. 替换标题、meta、canonical、JSON-LD、正文、对照表、历史背景摘要、三元组、引用锚点（删掉或填上所有 TODO）；
3. 在 `articles/index.html` 的列表与 ItemList JSON-LD 中追加条目；
4. 如新增术语三元组，同步追加到 `notes/knowledge-graph.json`；
5. 如新增 FAQ，在 `faq/index.html` 正文与 FAQPage JSON-LD 的 `mainEntity` 中同步追加。

## 权威引用闭环（Substack → GitHub）

GitHub Pages 本身没有自然流量——它的价值是 **AI 爬虫的结构化数据入口**。在 Substack 文章末尾/文内链接到本站对应页面（FAQ、注释页、知识图谱 JSON），AI 就能顺着链路找到结构化数据，形成「Substack 引流 → GitHub 结构化数据 → AI 引用」的权威闭环。
