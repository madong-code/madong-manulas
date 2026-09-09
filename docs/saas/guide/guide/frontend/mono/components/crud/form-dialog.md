# 表单弹窗配置

## 基本配置

表单弹窗通过 `formDialog` 配置项定义：

```typescript
{
  formDialog: {
    enabled: true,              // 是否启用表单弹窗，默认 true
    title: $t('common.title'), // 弹窗标题前缀
    width: 'w-[60%]',         // 弹窗宽度
    dialogType: 'modal',        // 弹窗类型：'modal' | 'drawer'
    wrapperClass: 'grid-cols-1', // 表单布局 class
    draggable: true,            // 是否可拖拽（仅 modal 有效）
    fullscreenButton: true,      // 是否显示全屏按钮

    // 表单 schema 定义
    schema: [ ... ],

    // 表单通用配置
    commonConfig: {
      labelWidth: 120,
      labelAlign: 'right',
    },

    // API 接口配置（可覆盖 crudApi）
    api: {
      add: (data) => Service.create(data),
      edit: (data) => Service.update(data.id, data),
      view: (id) => Service.getDetail(id),
    },

    // 钩子函数
    onOpen: (type, data) => {},    // 打开弹窗后回调
    beforeSubmit: (values, type) => {},  // 提交前回调
    onSuccess: (type, values) => {},    // 提交成功回调
    transformFormValues: (values, type) => {},  // 提交前数据转换
  }
}
```

## 弹窗类型

### Modal（对话框）

```typescript
formDialog: {
  dialogType: 'modal',
  width: 'w-[60%]',    // 宽度
  draggable: true,        // 可拖拽
  fullscreenButton: true, // 全屏按钮
}
```

### Drawer（抽屉）

```typescript
formDialog: {
  dialogType: 'drawer',
  width: 'w-[60%]',    // 宽度（如果是 drawer，表示宽度或高度）
}
```

## Schema 定义

`schema` 是一个表单字段数组，每个字段支持以下属性：

```typescript
{
  label: $t('common.title'),   // 标签
  fieldName: 'title',           // 字段名
  component: 'Input',           // 组件名称
  defaultValue: '',             // 默认值
  rules: 'required',           // 校验规则（字符串简写）
  rules: z.string().min(1),    // 校验规则（zod schema）

  formItemClass: 'col-span-2', // 表单项 CSS 类（用于布局）

  // 组件属性
  componentProps: {
    placeholder: '请输入',
    clearable: true,
  },

  // 动态组件属性（支持函数）
  componentProps: (values) => ({
    disabled: !!values.id,
  }),

  // 依赖配置
  dependencies: {
    triggerFields: ['type'],     // 触发字段
    show: (values) => ...,      // 显示条件
    required: (values) => ...,  // 必填条件
    disabled: (values) => ...,  // 禁用条件
  },
}
```

## 常用组件

### Input

```typescript
{
  label: $t('common.title'),
  fieldName: 'title',
  component: 'Input',
  rules: 'required',
  componentProps: {
    placeholder: $t('common.title_placeholder'),
    maxlength: 50,
    showWordLimit: true,
  },
}
```

### Select

```typescript
{
  label: $t('common.type'),
  fieldName: 'type',
  component: 'Select',
  defaultValue: 'type_a',
  rules: 'required',
  componentProps: {
    placeholder: $t('common.type_placeholder'),
    options: [
      { label: '类型A', value: 'type_a' },
      { label: '类型B', value: 'type_b' },
    ],
  },
}
```

### ApiDict（字典选择器）

```typescript
{
  label: $t('common.status'),
  fieldName: 'status',
  component: 'ApiDict',
  rules: 'required',
  componentProps: {
    code: 'sys_enabled_status',  // 字典编码
  },
}
```

### ApiSelect（API 选择器）

```typescript
{
  label: $t('common.dept'),
  fieldName: 'dept_id',
  component: 'ApiSelect',
  rules: 'required',
  componentProps: {
    api: '/adminapi/system/dept/list',  // API 接口
    labelField: 'title',  // 标签字段
    valueField: 'id',     // 值字段
    clearable: true,
  },
}
```

### Avatar（头像上传）

```typescript
{
  label: $t('common.icon'),
  fieldName: 'icon',
  component: 'Avatar',
  componentProps: {
    // 上传配置
  },
}
```

### InputNumber

```typescript
{
  label: $t('common.sort'),
  fieldName: 'sort',
  component: 'InputNumber',
  defaultValue: 0,
  componentProps: {
    min: 0,
    max: 9999,
    precision: 0,
  },
}
```

### Textarea

```typescript
{
  label: $t('common.desc'),
  fieldName: 'desc',
  component: 'Input',
  formItemClass: 'col-span-2',  // 占满一行
  componentProps: {
    type: 'textarea',
    rows: 4,
    placeholder: $t('common.desc_placeholder'),
  },
}
```

## 表单布局

通过 `wrapperClass` 控制表单列数：

```typescript
formDialog: {
  wrapperClass: 'grid-cols-1',  // 一列布局
  // wrapperClass: 'grid-cols-2',  // 两列布局
  // wrapperClass: 'grid-cols-3',  // 三列布局
}
```

通过 `formItemClass` 控制单个表单项占用的列数：

```typescript
{
  label: $t('common.desc'),
  fieldName: 'desc',
  component: 'Input',
  formItemClass: 'col-span-2',  // 占用两列
  componentProps: {
    type: 'textarea',
    rows: 4,
  },
}
```

## 校验规则

### 字符串简写

```typescript
rules: 'required'  // 必填
```

### Zod Schema

```typescript
rules: z.string().min(1, '请输入标题'),  // 必填
rules: z.string().regex(/^[a-z][a-z0-9_]*$/, '格式错误'),  // 正则校验
rules: z.number().min(0, '不能小于0'),  // 数值校验
```

## 完整示例

参考 `app/plugin/develop/schemas/index.tsx`：

```typescript
formDialog: {
  enabled: true,
  title: $t('app.plugin.develop.title'),
  width: 'w-[60%]',
  dialogType: 'drawer',  // 使用抽屉
  wrapperClass: 'grid-cols-1',  // 一列布局
  commonConfig: { labelWidth: 100, labelAlign: 'right' },

  schema: [
    // 图标（Avatar 上传组件）
    {
      label: $t('app.plugin.develop.form.icon'),
      fieldName: 'icon',
      component: 'Avatar',
      formItemClass: 'col-span-2',
      componentProps: {},
    },

    // 标题
    {
      label: $t('app.plugin.develop.form.title'),
      fieldName: 'title',
      component: 'Input',
      rules: 'required',
      formItemClass: 'col-span-2',
      componentProps: {
        placeholder: $t('app.plugin.develop.form.title_placeholder'),
      },
    },

    // 标识（新增时可编辑，编辑时禁用）
    {
      label: $t('app.plugin.develop.form.key'),
      fieldName: 'key',
      component: 'Input',
      rules: z
        .string()
        .min(1, $t('app.plugin.develop.form.key_required'))
        .regex(/^[a-z][a-z0-9_]*$/, $t('app.plugin.develop.form.key_pattern')),
      formItemClass: 'col-span-2',
      componentProps: (values: any) => ({
        placeholder: values?.id
          ? $t('app.plugin.develop.form.key_disabled')
          : $t('app.plugin.develop.form.key_placeholder'),
        disabled: !!values?.id,  // 编辑时禁用
      }),
    },

    // 描述
    {
      label: $t('app.plugin.develop.form.desc'),
      fieldName: 'desc',
      component: 'Input',
      formItemClass: 'col-span-2',
      componentProps: {
        type: 'textarea',
        rows: 4,
        placeholder: $t('app.plugin.develop.form.desc_placeholder'),
      },
    },
  ],
},
```

## 下一步

- [操作按钮配置](./actions.md) - 配置操作按钮
- [CrudApiInstance API](./api.md) - 了解编程式操作 API
