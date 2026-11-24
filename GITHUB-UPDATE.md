# 更新现有GitHub仓库

在线网站已通过Cloudflare命令发布；以下操作用于同步GitHub上的skill与源码，不需要重新创建仓库。

1. 打开原仓库english-grammar-lab的Code页。
2. 点击Add file → Upload files。
3. 在本地打开本次english-grammar-lab-v4-release.zip解压后的文件夹，选中里面全部文件和文件夹，拖到GitHub上传区域。保留assets、data、references、scripts、worker、pages等目录层级；不要再套一层发布包目录。
4. 提交说明可填写：Update grammar curriculum and exercise bank。
5. 点击Commit changes，确认根目录中的SKILL.md、README.md、index.html等已更新，并能进入data/units看到22个题源文件。

上传的是发布包的内容，不是整个ZIP文件。若使用ZIP，先解压后上传内部内容。不能只改SKILL.md，因为技能说明依赖新讲解、题库、模板和脚本。

发布包中的非秘密Cloudflare账号/数据库ID为当前项目配置。不要上传工作源目录的work、.wrangler、本地数据库、账号令牌或教材PDF。网页分享仍使用https://english-grammar-lab-904.pages.dev。

将来通过GitHub自动构建时，构建命令npm run build:pages，输出目录pages-output；继续绑定已有D1数据库DB，不要重置。


