# Cloudflare Workers + D1 部署

当前源码3.0包含1200道新题、旧904题历史索引和PDF/DOCX报告。正式站点使用PAGES.md的Pages方案；本页为备用Workers方案，账号入口为 `worker/index.js`，使用D1持久化数据库；不需要Render磁盘。原Node服务仅保留作本地备用，两套数据库和账号不会自动迁移。

## 本地测试

安装Node.js24 LTS，在本目录打开终端：

```sh
npm install
npm run build
npm run db:local
npm run dev
```

使用终端给出的本机网址。`scripts/test-worker.mjs` 默认测试端口31881，可先运行 `npx wrangler dev --port 31881` 再在另一终端执行 `npm run test:worker`。测试只针对本地数据库；不要把自动注册测试直接指向正式站点。

## 授权与发布

```sh
npx wrangler login --scopes account:read user:read workers:write workers_scripts:write d1:write
npx wrangler whoami
npx wrangler d1 create english-grammar-lab-db
```

登录授权需要账号主人在浏览器确认。创建数据库后，将返回的真实database_id填入wrangler.jsonc中，不要保留全零占位值。如果账号已有这个数据库，应查询并复用，不要重复创建。

```sh
npm run db:remote
npm run deploy
```

发布返回的workers.dev网址即为学生访问入口。第一次发布可能需要在Cloudflare控制台为Workers选择子域名，按实际界面完成后重试。默认使用平台提供的HTTPS网址，不要求购买自定义域名。

如果使用GitHub自动部署：先更新仓库全部文件，Cloudflare控制台进入Compute中的Workers & Pages，导入仓库。Build Command为 `npm run build`，Deploy Command为 `npx wrangler deploy`。先创建D1、填好真实ID并运行数据库迁移，再进行首次上线。命令部署和Git导入二选一即可，不必同时创建两个项目。

## 数据和安全

D1绑定名必须为DB；静态资源绑定为ASSETS。wrangler.jsonc只含配置和非秘密ID，不写密码或令牌。登录凭据存放在Wrangler用户配置中，不上传work、.wrangler、.dev.vars、Node存储目录或测试数据库。账号服务使用PBKDF2-SHA256（随机盐、100000次，匹配Workers运行环境），哈希保存会话token，登录限制存于D1。正式发布后应以实际用户规模检查平台配额和费用，不自动升级付费方案。

同步采用去重事件，服务端重新判分；不同账号隔离，切换浏览器账号后阻止把旧账号待同步记录写到新账号。上线前在两个独立浏览器注册、作答并验证同步。生产数据库备份可使用D1导出或Time Travel，不把备份上传公开仓库。

当前不含密码找回；请保管密码。旧Node账号不自动迁移。游客离线记录不自动上传，未完成的一组练习进度不跨设备恢复。

## 更新GitHub的Skill

将Cloudflare发布包内全部内容上传到原仓库根目录并覆盖同名文件，保留worker、migrations、public等目录；不要再套一层项目名文件夹。提交说明可写 `Add Cloudflare Workers and D1 deployment`。SKILL.md、README.md、CLOUDFLARE.md、wrangler.jsonc、package.json、package-lock.json、worker、migrations、assets和成品HTML需同步更新。

本地运行及接口检查不是公网部署证明；以wrangler deploy成功返回和公网health接口检查为准。

参考：[D1入门](https://developers.cloudflare.com/d1/get-started/)、[静态资源](https://developers.cloudflare.com/workers/static-assets/get-started/)、[Wrangler登录](https://developers.cloudflare.com/workers/wrangler/commands/general/)。

当前配置中的Cloudflare账号与D1 ID已填入本次实际创建的资源。它们不是密码，但在部署到其他人的账号时需要替换。更新本账号的项目请复用，不要重新创建数据库。


