# 开发规范 · Git

---

## 1. 分支模型

- `main` / `master`：稳定可发布。
- `develop`：集成分支。
- `feature/<desc>`：功能开发。
- `fix/<desc>`：缺陷修复。
- `release/<version>`：发布准备。

---

## 2. 提交信息

建议 Conventional Commits：

```text
feat(admin): 新增角色数据权限分配
fix(api): 修复会员列表分页错误
docs: 补充插件系统文档
refactor(core): 抽象 Crud 基类
```

类型：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`。

---

## 3. PR / MR

- 小步提交，单一职责。
- 描述「做什么 + 为什么」。
- 关联需求/缺陷单号。
- 通过 CI（lint / 类型检查）再合入。
- 改 `core/` 内核需特别评审（影响全局）。

---

## 4. 敏感信息

- 不提交 `.env`、密钥、token。
- 敏感配置走环境变量，仅 `.env.example` 入库。

---

## 5. 目录红线

- 受保护不可改：`frontend/packages/*`、`frontend/scripts/*`、`frontend/internal/*` 及依赖定义文件（见项目 memory）。
- `apps/*` 业务代码可改。
- 后端 `core/` 不可改，业务只在 `app/`。
