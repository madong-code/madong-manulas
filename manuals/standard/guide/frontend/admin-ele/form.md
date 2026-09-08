# Element Plus · 表单与弹窗

后台表单（新增/编辑/详情）统一由 `FormDialog` 弹窗承载，由 `CrudSchema.formDialog` 配置。

---

## 1. 表单渲染

`FormDialog` 内部使用 `useVbenForm`，表单字段来自 `formDialog.schema`：

```ts
formDialog: {
  schema: [
    { fieldName: 'name', label: $t('...'), component: 'Input', rules: 'required' },
    { fieldName: 'enabled', label: $t('...'), component: 'ApiDict',
      componentProps: { code: DictEnum.X, renderType: 'RadioGroup', isBtn: true },
      defaultValue: 1 },
  ],
  dialogType: 'modal',   // 'modal' | 'drawer'
  width: 'w-[40%]',
  title: $t('...'),
}
```

- `dialogType: 'drawer'` 可改为侧边抽屉。
- `width` 支持 Tailwind 宽度类，如 `w-[600px]` / `w-[90%]`。

---

## 2. 字段组件与 props

`component` 字符串对应 [`components.md`](./components.md) 注册的组件：

| component | 用途 |
| ---- | ---- |
| `Input` / `Textarea` | 文本 |
| `InputNumber` | 数字 |
| `DatePicker` | 日期（range 自动拆字段） |
| `ApiDict` | 字典下拉（绑定 `DictEnum`） |
| `ApiSelect` / `ApiTreeSelect` | 远程数据 |
| `Upload` | 文件/图片 |
| `Switch` / `RadioGroup` / `CheckboxGroup` | 状态/多选 |

`componentProps` 透传给底层组件（带 TS 类型提示，见 `ComponentPropsMap`）。

### ApiDict 渲染形态

```ts
componentProps: { code: DictEnum.SYS_ENABLED_STATUS, renderType: 'RadioGroup', isBtn: true }
```

- `renderType`：`Select` / `RadioGroup` / `CheckboxGroup`。
- `isBtn`：单选按钮组样式。

---

## 3. 校验

- 行内：`rules: 'required'` 或 `rules: 'selectRequired'`（预置规则）。
- 自定义函数：

```ts
rules: (value) => (value ? true : $t('ui.formRules.required'))
```

- 跨字段校验：在 `setupVbenForm` 中扩展 `defineRules`。

---

## 4. 详情（view）

`CrudSchema` 设置 `hasView: true` 时，列表操作列出现「详情」，弹窗以只读模式渲染 `formDialog.schema`，组件自动转 `disabled`。

---

## 5. 提交与回填

- **回填**：`FormDialog` 打开时调用 `crudApi.view(row.id)` 获取详情，按 `fieldName` 映射进表单 model。
- **提交**：新增调 `crudApi.add(model)`，编辑调 `crudApi.edit(model)`（自动带 `id`）。
- **Upload 注意**：`modelPropNameMap` 已配置 `Upload → fileList`，回填时后端返回 `fileList` 数组；提交前由组件转回后端所需结构。

---

## 6. 自定义表单布局

`schema` 支持 `group`（分组）与 `collapsed`：

```ts
schema: [
  { fieldName: 'name', component: 'Input', rules: 'required' },
  { fieldName: 'remark', component: 'Textarea' },
  { group: '高级', collapsed: true, schema: [ /* 折叠区字段 */ ] },
]
```

复杂联动（字段 A 变化影响字段 B 选项）用 `componentProps` 中的 `onChange` 或 `watch` 表单值。
