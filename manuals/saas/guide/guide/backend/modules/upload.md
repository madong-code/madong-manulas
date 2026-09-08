# 后端 · 文件上传

---

## 1. 上传接口

- 由 `web` / `system` 模块的上传 Service 提供（如 `StorageService`）。
- 接收 `multipart/form-data`，校验类型/大小，落盘或对象存储。
- 返回文件 URL / 文件列表。

---

## 2. 前端联动

- 前端 `Upload` 表单组件（`modelPropNameMap` 配 `fileList`），提交时由组件转后端所需结构（见 [`frontend/admin-ele/form.md`](../frontend/admin-ele/form.md)）。
- 回填时后端返回 `fileList` 数组。

---

## 3. 存储配置

- 本地：`public/uploads/`（Nginx 可直接访问）。
- 对象存储：通过 `config/madong.php` 或 `storage.php` 配置（OSS/COS 等）。
- 访问 URL 经后端返回，前端不关心物理路径。

---

## 4. 安全

- 校验文件类型白名单（防脚本上传）。
- 限制单文件大小。
- 重命名存储（避免路径遍历 / 覆盖）。
- 生产对象存储建议带签名 URL。
