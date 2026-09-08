# 文档维护约定

1. **一节一文件**：每个 Markdown 聚焦一个主题，避免超长文档。
2. **代码即文档**：示例代码来自真实可运行项目，不臆造 API。
3. **图片归资源区**：图片统一放 `manuals/<id>/assets/img/<板块>/`，正文用 `../assets/img/<板块>/x.png` 引用；站点级共享图放 `docs/assets/img/`。
4. **新增文件登记导航**：新增 `.md` 后必须在本手册 `_sidebar.md` 加链接，否则不出现在菜单；如需顶部入口再加 `_navbar.md`。
5. **新增一册手册**：复制 `manuals/_template/` → 填 `manual.json` → 在 `manuals.json` 注册一行（见 AI-GUIDE.md）。
6. **不改写既有正文**：重构后为「内容不变」原则，正文保持原样，只调目录与导航。
7. **命名规范**：`kebab-case` 文件名；板块目录用通俗英文（`backend/`、`frontend/`、`deploy/`…）。
8. **多手册隔离**：每册独立实例，删除 `manuals/<id>/` 即移除该手册及其图片，不影响其他册。
