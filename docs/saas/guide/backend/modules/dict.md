# 后端 · 数据字典

字典为下拉/状态展示提供可配置数据源，前端 `ApiDict` 组件消费。

---

## 1. 结构

- 字典类型表：`mic_system_dict_type`（`code` 如 `SYS_ENABLED_STATUS`）。
- 字典数据表：`mic_system_dict_data`（`code` + `label` + `value` + `sort`）。
- 前端枚举 `DictEnum` 直接引用类型 `code`（见 [`frontend/admin-ele/components.md`](../frontend/admin-ele/components.md)）。

---

## 2. 接口

- 字典数据接口（如 `GET /adminapi/system/dict-data/...`）返回 `{ label, value }` 列表。
- 前端 `ApiDict` 绑定 `DictEnum.X` 自动加载。

---

## 3. 缓存

- 字典数据后端缓存（Redis），变更时失效，减少查表。
- 前端可本地缓存字典。

---

## 4. 约定

- 新增字典需在 `DictEnum` 加对应常量，保持前后端一致。
- 字典 `value` 用字符串或整数，前后端约定统一。
- 业务状态优先用字典，避免硬编码魔法值。
