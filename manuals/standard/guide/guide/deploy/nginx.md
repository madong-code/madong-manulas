# Nginx 反代

Nginx 在 80/443 统一收口，把 API 反代到后端 Webman（8500），静态资源直接托管。以下为生产参考配置（基于 `template/admin/build/deploy/nginx.conf` 改造）。

```nginx
server {
    listen 80;
    server_name your.domain.com;

    # 后台静态站（也可由 Webman 直接服务 public/admin）
    location /admin/ {
        alias /var/www/mdadmin/template/admin/dist/;
        try_files $uri $uri/ /admin/index.html;
        index index.html;
    }

    # 前台静态站
    location / {
        alias /var/www/mdadmin/template/web/.output/public/;
        try_files $uri $uri/ /index.html;
    }

    # 后台接口
    location /adminapi/ {
        proxy_pass http://127.0.0.1:8500;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;   # SSE/导出可能耗时
    }

    # 前台接口
    location /api/ {
        proxy_pass http://127.0.0.1:8500;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 安装向导
    location /install/ {
        alias /var/www/mdadmin/template/install/dist/;
        try_files $uri $uri/ /install/index.html;
    }
}
```

要点：

- API 反代务必带 `X-Forwarded-*` 头，否则后端取到的客户端 IP / 协议不正确。
- `proxy_read_timeout` 调大，避免 SSE 进度流、数据导出被提前断开。
- 若 admin/web 直接放在 `backend/public/`，可去掉对应 `location` 静态块，由 Webman 托管。
- 生产建议开启 HTTPS（Let's Encrypt），并在 443 server 内做同样的反代。

## 静态站 MIME

Nuxt/Vben 产物含 `.mjs` 等模块脚本，Nginx 需识别：

```nginx
types {
    application/javascript js mjs;
}
```

官方 `nginx.conf` 已包含该配置，拷贝部署即可。
