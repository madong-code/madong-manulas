# MCP 工具

框架内置 MCP（Model Context Protocol）服务端，让 Trae、Cursor、Claude Code 等支持 MCP 的 AI 客户端能够直接调用系统内部工具。

## 作用

在 AI 编辑器的 Agent 对话中，AI 可以直接执行系统暴露的工具 —— 例如查询系统状态、验证调用者身份、调用业务查询，而不需要你手动复制粘贴或切换终端。典型用途：

- **AI 编辑器联调**：开发时让 Agent 直接调用后端工具验证逻辑
- **CI / 脚本**：以 API Key 机器身份查询系统信息
- **智能运维**：结合 Agent 做系统状态巡检

## 能做什么

- 端点：`/mcp`（Streamable HTTP 传输，POST 收发 JSON-RPC）
- 工具发现：`#[McpTool]` 属性标注即自动注册，无需手工登记
- 鉴权：API Key / 后台 JWT / 匿名 三通道，工具可见性随身份权限过滤
- 内置工具开箱即用：

| 工具名 | 权限 | 说明 |
|--------|------|------|
| `ping` | 匿名 | 连通性测试，恒定返回 `pong` |
| `system_info` | 匿名 | 系统运行信息，`section` 可选 overview / php / time |
| `current_user` | 需登录 | 返回当前调用者身份概要，用于验证鉴权链路 |

## 怎么用（快速路径）

1. 确认 `backend/config/mcp.php` 中 `enable => true`，启动后端服务（默认端口 8500）；
2. 在 AI 编辑器中添加 MCP Server（url `http://127.0.0.1:8500/mcp` + 鉴权头），见[编辑器接入](ide.md)；
3. 在挂载了 MCP 工具的智能体对话中发起调用（如「调用 madong 的 ping 工具」）。

业务工具的开发见[自定义工具](custom-tools.md)，生产部署策略见[生产环境](production.md)，问题排查见[常见问题](faq.md)。

## 定位与建议

MCP 当前定位为**开发联调与内部工具场景**（编辑器助手、CI、运维脚本），不建议直接暴露公网。

- **开发环境**：开启，供 AI 编辑器辅助开发、调试业务工具
- **生产环境**：默认不使用时将 `enable` 置为 `false`（端点返回 404，不暴露存在性）；确需使用时按[生产环境](production.md)一节加固
