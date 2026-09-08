# 3.1.7 UI 适配层

`src/adapter/` 是**定制 UI 行为的推荐入口**。它把内核（`src/core/`）的通用能力与项目实际使用的组件库绑定起来，在这里集中配置全局默认值，避免每个页面重复设置。

```
src/adapter/
├── form.ts             表单：全局校验规则、v-model 属性映射
├── vxe-table.ts        表格：全局默认配置、渲染器注册
├── component/index.ts  组件映射：表单可用组件清单
└── crud/index.ts       CRUD 能力再导出
```

> 需要改 UI 默认行为时，先看能否在 `adapter/` 解决，而不是去改 `src/core/`。

## 一、表格适配 `vxe-table.ts`

```ts
setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'left',
        border: 'none' as any,
        stripe: true,
        columnConfig: { resizable: true },
        height: 'auto',
        formConfig: { enabled: false },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    // 注册所有渲染器
    Object.entries(cellRenderers).forEach(([name, renderer]) => {
      vxeUI.renderer.add(name, renderer);
    });
  },
  useVbenForm,
});
```

### 关键配置说明

| 配置 | 值 | 含义 |
| --- | --- | --- |
| `align` | `left` | 单元格左对齐 |
| `border` | `none` | 无边框风格 |
| `stripe` | `true` | 斑马纹 |
| `height` | `auto` | 自适应高度（配合 `<Page auto-content-height>`） |
| `columnConfig.resizable` | `true` | 列宽可拖拽 |
| `showOverflow` | `true` | 内容溢出显示省略号 |
| `size` | `small` | 紧凑尺寸 |
| `round` | `true` | 圆角 |

### 分页响应字段映射（重要）

```ts
proxyConfig: {
  autoLoad: true,
  response: {
    result: 'items',
    total: 'total',
    list: 'items',
  },
}
```

这决定了**后端分页接口必须返回 `{ items: [], total: 0 }` 结构**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "items": [ { "id": 1, "name": "..." } ],
    "total": 100
  }
}
```

若后端返回的是 `list`/`rows`/`records`，要么改后端，要么改这里的映射。

- `autoLoad: true` — 表格挂载后自动请求第一页
- `showActiveMsg: true` — 操作成功提示
- `showResponseMsg: false` — 不使用响应体里的 msg 弹提示（由请求层统一处理，避免重复弹窗）

## 二、单元格渲染器

`src/components/render/components/` 下每个目录即一个渲染器，通过 glob **自动注册**，无需手动登记：

```ts
const modules = import.meta.glob('./**/index.tsx', { eager: true });

const rendererMap: Record<string, any> = {};
for (const path in modules) {
  // 从路径提取组件名：./cell-image/index.tsx -> CellImage
  const match = path.match(/\.\/([^/]+)\/index\.tsx$/);
  if (!match?.[1]) continue;
  const name = match[1].split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const renderer = (modules[path] as Record<string, unknown>)[`${name}Renderer`];
  if (renderer) rendererMap[name] = renderer;
}

export const cellRenderers = rendererMap;
```

### 内置渲染器

| 名称 | 目录 | 用途 |
| --- | --- | --- |
| `CellDict` | `cell-dict` | 字典值转文本 |
| `CellDictTag` | `cell-dict-tag` | 字典值转带色标签 |
| `CellImage` | `cell-image` | 图片预览 |
| `CellLink` | `cell-link` | 链接 |
| `CellOperation` | `cell-operation` | 操作按钮组 |
| `CellSwitch` | `cell-switch` | 开关（常用于状态切换） |
| `CellTag` | `cell-tag` | 单个标签 |
| `CellTags` | `cell-tags` | 多个标签 |

### 使用

```tsx
{
  field: 'enabled',
  title: '状态',
  minWidth: 80,
  cellRender: {
    name: 'CellDictTag',
    attrs: { code: DictEnum.SYS_ENABLED_STATUS },
  },
}
```

### 新增自定义渲染器

1. 新建 `src/components/render/components/cell-progress/index.tsx`
2. 导出名必须为 **`目录名的 PascalCase + Renderer`**，即 `CellProgressRenderer`

```tsx
export const CellProgressRenderer = {
  renderDefault(_renderOpts: any, params: any) {
    const { row, column } = params;
    return <ElProgress percentage={row[column.field] ?? 0} />;
  },
};
```

3. 直接使用，无需注册：

```tsx
{ field: 'rate', title: '完成度', cellRender: { name: 'CellProgress' } }
```

## 三、表单适配 `form.ts`

```ts
async function initSetupVbenForm() {
  setupVbenForm<ComponentType>({
    config: {
      modelPropNameMap: {
        Upload: 'fileList',
        CheckboxGroup: 'model-value',
      },
    },
    defineRules: {
      required: (value, _params, ctx) => {
        if (value === undefined || value === null || value.length === 0) {
          return $t('ui.formRules.required', [ctx.label]);
        }
        return true;
      },
      selectRequired: (value, _params, ctx) => {
        if (value === undefined || value === null) {
          return $t('ui.formRules.selectRequired', [ctx.label]);
        }
        return true;
      },
    },
  });
}
```

### `modelPropNameMap`

部分组件的双向绑定属性不是标准 `modelValue`，在此声明映射：

| 组件 | v-model 属性 |
| --- | --- |
| `Upload` | `fileList` |
| `CheckboxGroup` | `model-value` |

### 全局校验规则

`defineRules` 中定义的规则可在 schema 里以字符串引用：

```tsx
{ label: '岗位名称', fieldName: 'name', component: 'Input', rules: 'required' }
{ label: '状态',     fieldName: 'status', component: 'Select', rules: 'selectRequired' }
```

- `required` — 通用必填（对空数组也生效）
- `selectRequired` — 选择类必填

错误文案走国际化（`ui.formRules.required`），自动带上字段 `label`。

### 复杂校验用 zod

```tsx
import { z } from '#/adapter/form';

{
  label: '邮箱',
  fieldName: 'email',
  component: 'Input',
  rules: z.string().email('邮箱格式不正确'),
}
```

## 四、详情模式扩展

`form.ts` 在标准 schema 上扩展了三个字段，使**同一份表单配置可复用于详情展示**：

```ts
export type VbenFormSchema = {
  /** 在详情模式下隐藏该字段 */
  hideInDetail?: boolean;
  /** 详情模式使用的展示组件名称 */
  viewComponent?: string;
  /** 详情模式展示组件的参数 */
  viewComponentProps?: Record<string, any>;
} & BaseFormSchema;
```

```tsx
{
  label: '状态',
  fieldName: 'enabled',
  component: 'ApiDict',
  componentProps: { code: DictEnum.SYS_ENABLED_STATUS },
  // 详情态改用标签展示
  viewComponent: 'DictTag',
  viewComponentProps: { code: DictEnum.SYS_ENABLED_STATUS },
}

{
  label: '密码',
  fieldName: 'password',
  component: 'InputPassword',
  hideInDetail: true,   // 详情不展示
}
```

## 五、组件映射 `component/index.ts`

定义表单 `component` 字段可用的组件清单，Element Plus 组件采用**异步加载 + 样式按需引入**：

```ts
const ElDatePicker = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/date-picker/index'),
    import('element-plus/es/components/date-picker/style/css'),
  ]).then(([res]) => res.ElDatePicker),
);
```

还通过 `withDefaultPlaceholder` 统一注入了默认 placeholder：

```ts
const placeholder =
  props?.placeholder || attrs?.placeholder || $t(`ui.placeholder.${type}`);
```

因此表单项不写 `placeholder` 时会自动显示"请输入 / 请选择"（且已国际化）。

### 常用组件类型

| 类别 | 组件 |
| --- | --- |
| 输入 | `Input`、`Textarea`、`InputNumber`、`InputPassword` |
| 选择 | `Select`、`SelectV2`、`TreeSelect`、`RadioGroup`、`CheckboxGroup`、`Switch` |
| 日期 | `DatePicker`、`TimePicker` |
| 业务增强 | `ApiDict`（字典）、`ApiSelect`、`ApiTreeSelect`、`IconPicker`、`Upload` |
| 布局 | `Divider`、`Space` |

## 六、CRUD 再导出 `crud/index.ts`

```ts
export type {
  CrudApi,
  CrudApiInstance,
  CrudColumn,
  CrudSchema,
} from '#/components/crud/components/types';
export { default as Crud } from '#/components/crud/crud.vue';
export { useCrud } from '#/components/crud/use-crud';
```

业务代码统一从 `#/adapter/crud` 引入，屏蔽内部实现路径：

```ts
import { useCrud } from '#/adapter/crud';
import type { CrudSchema } from '#/adapter/crud';
```

## 七、定制建议

| 需求 | 改哪里 |
| --- | --- |
| 全站表格换风格（边框、尺寸） | `adapter/vxe-table.ts` 的 `vxeUI.setConfig` |
| 后端分页字段名不同 | `adapter/vxe-table.ts` 的 `proxyConfig.response` |
| 新增表格单元格样式 | 在 `components/render/components/` 新建目录 |
| 新增全局校验规则 | `adapter/form.ts` 的 `defineRules` |
| 新增表单可用组件 | `adapter/component/index.ts` |
| 组件 v-model 属性异常 | `adapter/form.ts` 的 `modelPropNameMap` |

> 下一节：[3.1.8 CRUD 页面开发](crud.md)
