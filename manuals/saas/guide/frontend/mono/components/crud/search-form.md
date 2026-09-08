# 搜索表单配置

## 基本配置

搜索表单通过 `searchForm` 配置项定义：

```typescript
{
  searchForm: {
    enabled: true,          // 是否启用搜索表单，默认 true
    collapsed: true,         // 是否折叠，默认 false
    collapsedRows: 2,       // 折叠时显示行数，默认 2
    submitOnChange: false,   // 提交方式，默认 false（需点击搜索按钮）
    schema: [ ... ],         // 表单 schema 定义
    commonConfig: { ... },   // 通用配置
  }
}
```

## Schema 定义

`schema` 是一个表单字段数组，每个字段支持以下属性：

```typescript
{
  component: 'Input',           // 组件名称
  fieldName: 'LIKE_title',     // 字段名（支持查询操作符前缀）
  label: $t('common.title'),   // 标签
  defaultValue: '',             // 默认值
  rules: 'required',           // 校验规则
  formItemClass: 'col-span-2', // 表单项 CSS 类
  componentProps: {             // 组件属性
    placeholder: '请输入',
    clearable: true,
  },
  dependencies: {               // 依赖配置
    triggerFields: ['type'],
    show: (values) => values.type === 'custom',
  },
}
```

## 查询操作符

字段名支持以下前缀，用于指定查询方式：

| 前缀 | 说明 | 示例 |
|------|------|------|
| `LIKE_` | 模糊查询 | `LIKE_title` → `WHERE title LIKE '%value%'` |
| `EQ_` | 等于 | `EQ_status` → `WHERE status = 'value'` |
| `NE_` | 不等于 | `NE_status` → `WHERE status != 'value'` |
| `GT_` | 大于 | `GT_created_at` → `WHERE created_at > 'value'` |
| `LT_` | 小于 | `LT_created_at` → `WHERE created_at < 'value'` |
| `GTE_` | 大于等于 | `GTE_price` → `WHERE price >= 'value'` |
| `LTE_` | 小于等于 | `LTE_price` → `WHERE price <= 'value'` |
| `IN_` | IN 查询 | `IN_ids` → `WHERE id IN (1, 2, 3)` |
| `NOTIN_` | NOT IN 查询 | `NOTIN_ids` → `WHERE id NOT IN (1, 2, 3)` |
| `NULL_` | IS NULL | `NULL_deleted_at` → `WHERE deleted_at IS NULL` |
| `NOTNULL_` | IS NOT NULL | `NOTNULL_deleted_at` → `WHERE deleted_at IS NOT NULL` |

**实际示例**：

```typescript
searchForm: {
  enabled: true,
  collapsed: true,
  collapsedRows: 2,
  schema: [
    // 模糊查询：WHERE title LIKE '%value%'
    {
      component: 'Input',
      fieldName: 'LIKE_title',
      label: $t('common.title'),
      componentProps: {
        placeholder: $t('common.title'),
        clearable: true,
      },
    },

    // 等于查询：WHERE status = 'value'
    {
      component: 'ApiDict',
      fieldName: 'EQ_status',
      label: $t('common.status'),
      componentProps: {
        code: 'sys_enabled_status',
        clearable: true,
      },
    },

    // 范围查询：WHERE created_at >= 'start' AND created_at <= 'end'
    {
      component: 'DatePicker',
      fieldName: 'GTE_created_at',
      label: $t('common.created_start'),
    },
    {
      component: 'DatePicker',
      fieldName: 'LTE_created_at',
      label: $t('common.created_end'),
    },
  ],
}
```

## 常用组件

### Input

```typescript
{
  component: 'Input',
  fieldName: 'LIKE_title',
  label: $t('common.title'),
  componentProps: {
    placeholder: '请输入标题',
    clearable: true,
    maxlength: 50,
  },
}
```

### Select

```typescript
{
  component: 'Select',
  fieldName: 'EQ_type',
  label: $t('common.type'),
  componentProps: {
    placeholder: '请选择类型',
    clearable: true,
    options: [
      { label: '类型A', value: 'a' },
      { label: '类型B', value: 'b' },
    ],
  },
}
```

### ApiDict（字典选择器）

```typescript
{
  component: 'ApiDict',
  fieldName: 'EQ_status',
  label: $t('common.status'),
  componentProps: {
    code: 'sys_enabled_status',  // 字典编码
    clearable: true,
  },
}
```

### ApiSelect（API 选择器）

```typescript
{
  component: 'ApiSelect',
  fieldName: 'EQ_dept_id',
  label: $t('common.dept'),
  componentProps: {
    api: '/adminapi/system/dept/list',  // API 接口
    clearable: true,
    labelField: 'title',  // 标签字段
    valueField: 'id',     // 值字段
  },
}
```

### DatePicker（日期选择器）

```typescript
{
  component: 'DatePicker',
  fieldName: 'GTE_created_at',
  label: $t('common.created_start'),
  componentProps: {
    type: 'date',
    placeholder: '开始日期',
    clearable: true,
  },
}
```

## 完整示例

参考 `app/plugin/develop/schemas/index.tsx`：

```typescript
searchForm: {
  enabled: true,
  collapsed: true,
  collapsedRows: 2,
  schema: [
    {
      component: 'Input',
      fieldName: 'LIKE_desc',
      label: $t('app.plugin.develop.search.desc'),
      componentProps: {
        placeholder: $t('app.plugin.develop.search.desc'),
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'LIKE_title',
      label: $t('app.plugin.develop.search.title'),
      componentProps: {
        placeholder: $t('app.plugin.develop.search.title'),
        clearable: true,
      },
    },
    {
      component: 'ApiDict',
      fieldName: 'EQ_status',
      label: $t('app.plugin.develop.search.status'),
      componentProps: { code: 'sys_enabled_status', clearable: true },
    },
  ],
},
```

## 下一步

- [表单弹窗配置](./form-dialog.md) - 配置新增/编辑/查看弹窗
- [操作按钮配置](./actions.md) - 配置操作按钮
