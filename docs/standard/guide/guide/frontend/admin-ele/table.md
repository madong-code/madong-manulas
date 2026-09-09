# Element Plus · 表格与查询

后台列表基于 **VxeTable** 封装的 `BasicCrud` 组件，由 `useCrud(schema)` 驱动。Schema 详见 [getting-started.md](./getting-started.md) 的 `useCrudSchema()`。

---

## 1. 渲染链路

```text
useCrudSchema() ──► useCrud() ──► <BasicCrud /> ──► VxeTable 渲染
   (CrudSchema)        (返回组件)      (adapter 注入)
```

`useCrud` 出自 `src/adapter/crud`，重导出 `@vben/plugins/vxe-table` 的 `useCrud` 与类型 `CrudSchema`。

---

## 2. CrudSchema.columns 字段

`columns` 为 VxeTable 列配置数组，常用：

| 字段 | 说明 |
| ---- | ---- |
| `type: 'checkbox'` | 行选择列 |
| `field` | 数据字段名 |
| `title` | 列标题（建议 `$t(...)`） |
| `minWidth` / `width` | 列宽 |
| `align` | `left/center/right` |
| `cellRender` | 单元格渲染器（见下） |
| `formatter` | 值格式化函数 |
| `sortable` | 是否可排序 |
| `treeNode` | 树形表时标记父节点 |
| `slots` | 自定义插槽（`default` / `header`） |

### 单元格渲染器 cellRender

```ts
cellRender: { name: 'CellDictTag', attrs: { code: DictEnum.SYS_ENABLED_STATUS } }
```

- `name` 对应在 `adapter/vxe-table.ts` 注册的渲染器（如 `CellDictTag` 字典标签、`CellImage` 图片、`CellLink` 链接）。
- `attrs` 为渲染器 props。

---

## 3. 查询表单 searchForm

```ts
searchForm: {
  schema: [
    { fieldName: 'LIKE_name', label: $t('...'), component: 'Input' },
    { fieldName: 'EQ_enabled', label: $t('...'), component: 'ApiDict', componentProps: { code: DictEnum.SYS_ENABLED_STATUS, clearable: true } },
  ],
}
```

**字段名前缀约定**（与后端一致，见 [`backend/basic/request-response.md`](../../backend/basic/request-response.md)）：

| 前缀 | 含义 |
| ---- | ---- |
| `EQ_` | 等于 |
| `NE_` | 不等于 |
| `LIKE_` | 模糊 |
| `GT_` / `LT_` | 大于 / 小于 |
| `GTE_` / `LTE_` | 大于等于 / 小于等于 |
| `IN_` | 在集合内 |
| `BETWEEN_` | 区间 |

查询值经 `requestClient` 提交到后端 `GET /adminapi/...`，后端按前缀解析。

---

## 4. 操作列与权限

```ts
columns: [
  // ...
  {
    title: $t('common.operation'),
    fixed: 'right',
    width: 200,
    cellRender: {
      name: 'CellOperation',
      attrs: {
        buttons: [
          { text: $t('common.edit'), code: 'system:goods_category:update', onClick: ({ row }) => edit(row) },
          { text: $t('common.delete'), code: 'system:goods_category:delete', danger: true, onClick: ({ row }) => remove(row) },
        ],
      },
    },
  },
]
```

- `code` 与 `permissions` 中的权限码联动，无权限按钮自动隐藏。
- 也可在 `CrudSchema` 顶层用 `hasEdit / hasRemove` 自动生成操作按钮。

---

## 5. 树形 / 分页

- **树形表**：`columns` 中父行加 `treeNode: true`，`crudApi.list` 返回带 `children` 的数据结构。
- **分页**：`BasicCrud` 默认分页，后端返回 `{ items, total, page, pageSize }` 格式（见后端响应约定）。
- **排序**：列 `sortable: true`，提交 `sortField`、`sortOrder` 给后端。

---

## 6. 自定义渲染插槽

```ts
columns: [
  {
    field: 'name', title: $t('...'),
    slots: { default: (row) => h('span', { class: 'font-bold' }, row.name) },
  },
]
```

复杂渲染（如状态切换开关、跳转链接）推荐用 `cellRender` 复用已注册渲染器，避免每页重复写插槽。
