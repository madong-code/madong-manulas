# 表单基础组件

## 简介

表单组件是 admin / platform 两个应用**共用的核心基础组件**，基于 Vben 的 `useVbenForm` + Element Plus 封装，通过 **Schema 配置** 生成表单，无需手写 HTML。

## 组件位置

```
apps/{admin,platform}/src/components/form/
├── index.ts              # 表单导出（含扩展业务控件）
├── component-map.ts      # 组件映射
└── components/           # 扩展表单控件
```

## 统一适配器导出

业务代码统一从 `#/adapter/form` 导入：

```typescript
// apps/{admin,platform}/src/adapter/form/index.ts
import { useVbenForm as useForm } from '@vben-core/form';
// ...（含 vxe-table 联动等扩展）

export { useForm };
```

## 基本用法

```vue
<script setup lang="ts">
import { useVbenForm as useForm } from '#/adapter/form';

const [BasicForm, formApi] = useForm({
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: '请输入用户名' },
      fieldName: 'username',
      label: '用户名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
      rules: 'required',
    },
  ],
});
</script>

<template>
  <BasicForm />
</template>
```

## Schema 配置

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fieldName` | `string` | 字段名（表单数据 key） |
| `label` | `string` | 标签名 |
| `component` | `string` | 控件类型（Input/Select/DatePicker/...） |
| `componentProps` | `object` | 控件属性 |
| `rules` | `string \| RuleItem[]` | 校验规则（`required` 为简写） |
| `disabled` | `boolean \| fn` | 是否禁用 |
| `if` / `show` | `boolean \| fn` | 条件渲染 |
| `dependencies` | `object[]` | 联动依赖 |

## 在 CRUD 中使用

CRUD 的表单弹窗通过 `useCrudSchemas` 把 schema 拆分为弹窗表单项与搜索表单项：

```typescript
const { crudSchemas, formItems, searchItems } = useCrudSchemas([...]);
```

详见 [CRUD 基础组件](./crud/overview.md)。

## 表单 API

`useForm` 返回 `[BasicForm, formApi]`，`formApi` 提供：

| 方法 | 说明 |
| --- | --- |
| `setValues(data)` | 设置表单值 |
| `validate()` | 校验并返回数据 |
| `resetForm()` | 重置表单 |
| `setState('loading', bool)` | 设置提交状态 |
| `getValues()` | 获取当前值 |
| `updateSchema(...)` | 动态更新 schema |

## 各应用差异

表单组件 admin / platform 同源，用法一致，仅业务模块与权限码不同。

## 下一步

- [CRUD 基础组件](./crud/overview.md)
- [基础组件总览](./overview.md)
