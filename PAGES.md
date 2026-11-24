当前4.0.0已发布，沿用原页面布局，保留扩充内容与1660题；真实线上D1账号同步已验证，见DEPLOYMENT.md。

# 当前使用：Cloudflare Pages + D1

正式分享地址：https://english-grammar-lab-904.pages.dev

2026-11-11已发布，用户确认浏览器可打开。原workers.dev地址在当前用户网络中不能正常访问，保留为备用，不用于分享。

## 架构与验证

Pages高级模式运行账号服务，数据库仍为原D1 english-grammar-lab-db，没有重建或迁移用户数据。worker/pages-entry.js复用worker/index.js并内联HTML，避免静态资源的/index.html规范化重定向循环。新版为22专题、189个知识条目和1660道练习；旧904题仅留历史索引，PDF及DOCX导出保留。

此前3.0.0版已在Pages本地运行环境完成注册、登录、双会话错题同步、去重、账号隔离、清空记录、CSRF和静态网页检查。也在正式HTTPS服务完成临时账号注册、密码登录、两独立会话同步、重发去重、答对移除及HTML响应测试，测试账号已清理。线上诊断使用有效证书校验和另一个Cloudflare边缘IP；默认网络到部分Pages边缘IP仍超时，用户浏览器访问已确认可用，不保证所有网络或地区始终可访问。

## 构建、测试与更新

```sh
npm install
npm run build:pages
npx wrangler --cwd pages d1 migrations apply english-grammar-lab-db --local
npx wrangler --cwd pages pages dev ../pages-output --port 31882
```

另一终端设置TEST_ORIGIN为http://127.0.0.1:31882后运行node scripts/test-worker.mjs，仅对本地进行自动测试，不向正式站点批量注册账号。

发布现有项目：

```sh
npx wrangler login --scopes account:read user:read workers:write workers_scripts:write d1:write pages:write
npm run deploy:pages
```

正式项目english-grammar-lab-904已经创建，不再执行项目创建命令，也不加--force。Cloudflare新版本可能默认把新Pages项目引导到Workers，只有创建全新传统Pages项目且明确希望使用pages.dev时才使用对应版本官方提供的选项；现有项目发布无需它。

Pages配置固定位置为pages/wrangler.jsonc；Pages命令不支持自定义--config路径。该配置不填写account_id，使用已登录账号；多账号用户可通过CLOUDFLARE_ACCOUNT_ID环境变量选择正确账号。DB仍绑定同一个真实D1 ID。

## GitHub 更新

最终发布包目录：D:\CodexOutputs\english-grammar-lab-cloudflare-release。

把该目录内全部文件及文件夹上传到原仓库根目录并覆盖同名内容。新增pages、pages-output及worker/pages-entry.js必须保留。不要上传工作目录里的work、.wrangler、令牌、测试记录或本地数据库。Skill说明同步更新，网页分享使用上述pages.dev网址。

若通过Cloudflare控制台连接GitHub自动部署，使用Pages项目，构建命令npm run build:pages，输出目录pages-output；确认生产D1绑定DB指向english-grammar-lab-db。命令发布已可用，无需为自动部署重复创建项目。



