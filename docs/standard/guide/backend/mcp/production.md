# 生产环境

生产环境按是否使用 MCP 分两种策略：

## 不使用（推荐默认）

`enable => false`，端点返回 404。CLI 命令不受影响。

## 确需使用时

1. **关闭匿名不需要的工具**：检查所有 `permission: null` 的内置/自定义工具，生产上不需要的改为 `false` 或加权限码；
2. **API Key 使用强随机值**：如 `openssl rand -hex 32` 生成，`permissions` 给最小权限码集合，不要用 `['*']`；不同消费方（CI、运维脚本）使用不同 key 便于审计与吊销；
3. **走 HTTPS**：MCP 请求头携带凭证，必须经 TLS 传输；Nginx 反代时将 `/mcp` 正确转发到 webman（注意该路径不在 `/adminapi` 分组）；
4. **会话存储换 redis**：多进程/多机部署时 `session.store` 置为 `redis`，避免 file 存储会话不共享；
5. **收紧网络面**：用防火墙/Nginx 将 `/mcp` 限制为内网或 VPN 来源，不对公网开放；
6. **关注日志**：`McpAuthException`（401）频繁出现说明有凭证泄露或扫描探测，及时吊销 key。
