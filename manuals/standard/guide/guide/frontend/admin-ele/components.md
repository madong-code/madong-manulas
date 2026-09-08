# Element Plus · 组件适配

本文说明 Element Plus 组件是如何接入 Vben 适配层、并能在 `FormSchema` 中通过 `component: 'Input'` 字符串引用的。

---

## 1. 两段式注册机制

```text
components/form/components/*/index.vue   ──► component-map 自动扫描 (index.ts)
        │                                       │
        │ 注册为 kebab 名（如 api-select）       │
        ▼                                       ▼
adapter/component/index.ts ──► globalShareState.setComponents({...})
        │
        ▼
FormSchema.component: 'ApiSelect' 命中
```

### 1.1 component-map 自动扫描

`src/components/form/components/index.ts` 用 `import.meta.glob` 扫描各业务组件目录，`kebab-case` 目录名 → `PascalCase` 组件名：

```ts
// 示意：扫描 ./components/form/components/*/index.{vue,tsx}
const modules = import.meta.glob('./components/form/components/*/index.{vue,tsx}', { eager: true });
// 生成 { 'api-select': Component, 'api-dict': Component, ... }
export function getAll() { return formComponentsMap; }
```

新增一个表单组件只需在 `components/form/components/` 下新建目录并实现 `index.vue`，**无需手动 import**。

### 1.2 adapter 注册

`src/adapter/component/index.ts` 中：

```ts
const formComponents = getFormComponents();        // 来自 component-map
const formComponentsObj = {};
formComponents.forEach((comp, name) => { formComponentsObj[name] = comp; });

const components = {
  ...formComponentsObj,                            // 自动扫描的 Api* / Upload 等
  Input: withDefaultPlaceholder(ElInput, 'input'),
  InputNumber: withDefaultPlaceholder(ElInputNumber, 'input'),
  Textarea: withDefaultPlaceholder(ElInput, 'input', { type: 'textarea' }),
  DatePicker: (props, { attrs, slots }) => h(ElDatePicker, { ...props, ...attrs }, slots),
};
globalShareState.setComponents(components);
```

- `withDefaultPlaceholder(...)`：自动补 `placeholder`（取自 `$t('ui.placeholder.input')`），并透传组件方法（expose proxy）。
- 体积大的组件用 `defineAsyncComponent` 懒加载（如 `ElDatePicker`、`ElInput`）。

---

## 2. 已注册组件清单（ComponentType）

| 名称 | 来源 | 说明 |
| ---- | ---- | ---- |
| `Input` | EP `ElInput` | 文本输入 |
| `InputNumber` | EP `ElInputNumber` | 数字 |
| `Textarea` | `ElInput type=textarea` | 多行文本 |
| `DatePicker` | EP `ElDatePicker` | 日期（含 range 自动拆 name/id） |
| `ApiSelect` | 业务组件 | 远程下拉 |
| `ApiDict` | 业务组件 | 字典下拉（绑定 `DictEnum`） |
| `ApiTreeSelect` | 业务组件 | 远程树选 |
| `ApiSelectDept/Role/Position` | 业务组件 | 部门/角色/岗位选择 |
| `CheckboxGroup` | 业务组件 | 多选 |
| `RadioGroup` | 业务组件 | 单选 |
| `Switch` | 业务组件 | 开关 |
| `Upload` | 业务组件 | 上传（`fileList` 映射） |
| `Avatar` / `IconPicker` / `Editor` / `KeyValueEditor` / `Divider` / `Space` / `TreeSelect` | 业务组件 | 头像/图标/富文本/键值/分割/间距/树 |

> `ComponentType` 还联合了 `BaseFormComponentType`（Vben 基础组件如 `RangePicker` 等），保证类型提示完整。

---

## 3. 类型映射 ComponentPropsMap

为 Schema 中 `componentProps` 提供 TS 类型提示：

```ts
export interface ComponentPropsMap {
  Input: InputProps;                 // 来自 'element-plus'
  ApiDict: Record<string, any>;
  ApiSelect: ApiComponentSharedProps & SelectV2Props;
  DatePicker: DatePickerProps;
  // ...
}
```

`FormSchema` 通过泛型 `useVbenForm<ComponentType, ComponentPropsMap>` 获得 `component` + `componentProps` 联动补全。

---

## 4. model 映射（重要）

不同组件 v-model 字段名不同，需在 `adapter/form.ts` 声明：

```ts
setupVbenForm<ComponentType>({
  config: {
    modelPropNameMap: {
      Upload: 'fileList',          // Upload 用 fileList 而非 modelValue
      CheckboxGroup: 'model-value',
    },
  },
});
```

漏配会导致表单值无法回填。

---

## 5. 校验规则

`adapter/form.ts` 中预置：

```ts
defineRules: {
  required: (value, _p, ctx) =>
    (value === undefined || value === null || value.length === 0)
      ? $t('ui.formRules.required', [ctx.label]) : true,
  selectRequired: (value, _p, ctx) =>
    (value === undefined || value === null) ? $t('ui.formRules.selectRequired', [ctx.label]) : true,
}
```

Schema 中直接用 `rules: 'required'` 字符串引用。新增规则在此 `defineRules` 扩展即可。
