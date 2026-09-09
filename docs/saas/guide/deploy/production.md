# 部署 · 生产构建

---

## 1. 后端

```bash
cd backend
composer install --no-dev -o        # 生产依赖，优化 autoload
cp .env.example .env                 # 填写生产配置
php phinx migrate                    # 执行迁移
# 关闭 monitor：.env 中 monitor 段注释
php webman start -d                  # 守护进程
```

- 生产关闭 `monitor` 进程（`.env` 注释），避免文件监控开销与误重载。
- 开启 PHP `opcache`。
- 确保 `runtime/` 可写（日志、缓存、install.lock）。

---

## 2. 后台前端（admin）

```bash
cd template/mono/apps/admin
pnpm build                          # 输出 dist/
# 由 Nginx 托管 dist/ 静态文件，API 反代到 /adminapi
```

> admin / platform / install 都在 `template/mono/` monorepo 下，依赖在 mono 根目录 `pnpm install` 一次性安装。

- `VITE_GLOB_API_URL=/adminapi` 指向后端反代路径。
- 多套 UI 构建：切 `.env` 的 UI 标识后构建对应套。

---

## 3. 门户前端（web，Nuxt）

```bash
cd template/web
pnpm install
pnpm build                          # 输出 .output/（SSR）
# 或一体化：pnpm build:integrated（交给 Webman 托管）
node .output/server/index.mjs      # 独立 Node 启动
```

- SSR 模式需 Node 运行时；integrated 模式由后端托管静态产物。

---

## 4. 安装向导前端（install）

```bash
cd template/mono/apps/install
pnpm build                          # 或 pnpm build:integrated
```

- 安装完成后该前端/接口可禁用。

---

## 5. 环境变量检查清单

- [ ] `DB_*` 指向生产库
- [ ] `REDIS_*` 密码已设
- [ ] JWT 密钥为强随机值
- [ ] `APP_DEBUG=false`
- [ ] `monitor` 段已关闭
- [ ] 静态资源域名/CDN 已配
