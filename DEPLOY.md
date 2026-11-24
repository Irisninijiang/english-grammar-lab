推荐使用Cloudflare部署，详见 [CLOUDFLARE.md](CLOUDFLARE.md)。以下为备用Node＋Render方案，不是当前Cloudflare方案。

# GitHub 更新与联网部署

## 更新现有 GitHub Skill

需要更新：新版的题库、导出、账号功能及Skill说明都改变了，必须整套更新。

1. 解压发布ZIP，打开最内层项目目录，能直接看到 `SKILL.md` 和 `package.json`。
2. 进入原来的GitHub仓库，点 **Add file → Upload files**。
3. 把目录中的全部内容拖入上传区，保持assets、data、references、scripts、server的文件夹结构，不要再套一层v2目录，不要只上传ZIP。
4. 确认根目录有index.html、grammarlab.html、package.json、.node-version、.gitignore、SKILL.md、README.md、DEPLOY.md，以及五个配套文件夹。
5. 提交说明可填 `Add expanded exercises, reports and account sync`，点击 **Commit changes**。

本次未操作远程仓库。发布ZIP已排除work、storage、数据库和测试报告；原文件没有移动或删除。不要自行上传账号数据库、.env或浏览器配置。保存旧版ZIP便于回退。

## 先在本机测试

安装Node.js24 LTS，在项目文件夹打开终端，执行：

```powershell
node server/server.mjs
```

保持终端运行，浏览器打开 `http://localhost:3000`，点击“账号与同步”注册。故意答错一道题，再用另一个浏览器打开同一地址，登录同一账号检查错题。localhost只代表本机，不是公网分享链接。

## 公网部署示例：Render

需要自行创建Render账号并连接GitHub。这版用SQLite，必须使用持久化磁盘；Render的持久化磁盘用于付费服务，具体费用在创建时确认。本次没有开通或购买服务。[官方磁盘说明](https://render.com/docs/disks)

1. 打开 [Render控制台](https://dashboard.render.com/)，选 **New → Web Service**，连接更新后的仓库，分支main。
2. 环境选Node，Root Directory留空。Build Command填 `node scripts/build.mjs`，Start Command填 `node server/server.mjs`。仓库.node-version指定Node24。
3. 选择支持持久化磁盘的实例，在Disks中添加磁盘，挂载路径填 `/var/data`。
4. 设置环境变量：`DATA_DIR=/var/data`、`NODE_ENV=production`、`PUBLIC_ORIGIN=https://你的实际服务域名.onrender.com`。网址必须与浏览器使用的协议域名完全一致，不带末尾斜线，不要原样填写示例。
5. 若创建后才知道服务网址，填好变量并重新部署。生产服务缺少正确HTTPS地址时会拒绝启动，配置完整后再部署即可。
6. 部署成功后，用设备A打开该HTTPS网址注册、练习；设备B打开同一个网址并登录。检查错题与统计，答对移除后在A点击立即同步验证。

平台负责HTTPS和PORT，不必手填PORT。服务创建入口以实际平台界面为准。[Node部署说明](https://render.com/docs/deploy-node-express-app)

没有持久化磁盘时，服务重启或重新部署可能丢失账号和学习数据。确认DATA_DIR指向挂载目录，正式使用前建立一致的SQLite数据库备份及恢复流程。[持久化范围](https://render.com/docs/disks)

如果暂不希望付费，可先在电脑本地演示。学校已有Node服务器时也可部署同一套代码，配置HTTPS反向代理、PUBLIC_ORIGIN和持久化目录，无需购买Render。

## 后续更新

修改题库、模板或Skill后，在GitHub重新上传同名文件并提交。Render若开启对应分支的自动部署，会拉取更新。更换域名要修改PUBLIC_ORIGIN，不要覆盖生产数据库。

GitHub链接用于查看源码与Skill；联网服务网址用于账号学习。GitHub Pages是静态托管，无法运行这个Node账号后端。

