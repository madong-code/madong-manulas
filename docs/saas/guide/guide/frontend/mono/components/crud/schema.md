# CrudSchema 配置详解

`CrudSchema` 是 CRUD 组件的核心配置对象，采用扁平化配置设计，所有表格配置项可直接定义在顶层。

## 完整类型定义

```typescript
export interface CrudSchema extends Partial<TableConfig> {
  // --- 必填：API 接口 ---
  crudApi: CrudApi

  // --- 可选：表格列定义 ---
  columns?: (() => CrudColumn[]) | CrudColumn[]

  // --- 可选：数据处理钩子 ---
  beforeFetch?: (params: any) => any
  afterFetch?: (res: any) => any

  // --- 可选：搜索表单配置 ---
  searchForm?: SearchFormConfig

  // --- 可选：表单弹窗配置 ---
  formDialog?: FormDialogConfig
}
```

## API 接口配置

### CrudApi

定义后端接口，支持以下 6 个方法：

```typescript
export interface CrudApi {
  // 查询列表（必填）
  list: (params: any) => Promise<any>

  // 新增（可选）
  add?: (params: any) => Promise<any>

  // 编辑（可选）
  edit?: (params: any) => Promise<any>

  // 单个删除（可选）
  remove?: (params: any) => Promise<any>

  // 批量删除（可选）
  batchRemove?: (params: { ids: any[] }) => Promise<any>

  // 查看详情（可选）
  view?: (id: any) => Promise<any>
}
```

**实际示例**：

```typescript
crudApi: {
  list: (params) => MenuService.getList(params),
  add: (data) => MenuService.create(data),
  edit: (data) => MenuService.update(data.id, data),
  remove: (id) => MenuService.remove(id),
  batchRemove: (ids) => MenuService.batchRemove(ids),
  view: (id) => MenuService.getDetail(id),
}
```

## 表格基础配置

### 表格操作按钮开关

```typescript
{
  hasAdd: true,      // 是否显示新增按钮，默认 true
  hasEdit: true,     // 是否显示编辑按钮，默认 true
  hasRemove: true,   // 是否显示删除按钮，默认 true
  hasView: true,     // 是否显示查看按钮，默认 true
  hasBatchRemove: true, // 是否显示批量删除按钮，默认 true
}
```

### 行数据 Key

```typescript
{
  rowKey: 'id',  // 行数据的 key 字段，默认 'id'
}
```

### 权限配置

```typescript
{
  permissions: {
    add: 'system:menu:create',
    edit: 'system:menu:update',
    remove: 'system:menu:delete',
    view: 'system:menu:read',
  }
}
```

权限字符串会传递给操作按钮的 `auth` 属性，控制按钮显示。

## 数据处理钩子

### beforeFetch

请求前处理参数，用于添加额外参数或修改查询参数：

```typescript
{
  beforeFetch: (params) => {
    // 添加额外的查询参数
    return {
      ...params,
      tenant_id: 1,
    }
  }
}
```

### afterFetch

请求后处理结果，用于数据转换：

```typescript
{
  afterFetch: (res) => {
    // 转换数据格式
    return {
      ...res,
      data: res.items || [],
    }
  }
}
```

## 表格配置项

除了上述配置，`CrudSchema` 还支持所有 `TableConfig` 配置项（扁平化配置）：

```typescript
{
  // 分页配置
  pagination: {
    currentKey: 'page',  // 当前页字段名，默认 'page'
    sizeKey: 'limit',     // 每页大小字段名，默认 'limit'
  },

  // 树形结构配置
  tree: {
    pid: 'parentId',     // 父级 ID 字段名，默认 'parentId'
    id: 'id',           // ID 字段名，默认 'id'
    children: 'children', // 子节点字段名，默认 'children'
  },

  // 工具栏配置
  toolbar: {
    refresh: true,       // 是否显示刷新按钮
    custom: true,        // 是否显示自定义按钮
    zoom: true,          // 是否显示缩放按钮
    export: false,       // 是否显示导出按钮
    search: true,        // 是否显示搜索按钮（自动根据 searchForm 配置）
  },

  // 表格样式配置
  border: true,         // 是否显示边框
  stripe: true,         // 是否显示斑马纹
  hoverRow: true,       // 是否高亮悬停行
  highlightCurrentRow: true,  // 是否高亮当前行
  showOverflow: 'tooltip',     // 溢出显示方式

  // 选择配置
  checkable: true,      // 是否可选择（显示多选框）
  checkboxColumnWidth: 60,   // 多选框列宽度
  seqColumnWidth: 60,        // 序号列宽度

  // 表格高度
  height: 'auto',       // 表格高度，默认 'auto'
}
```

## 完整配置示例

```typescript
export const useCrudSchema = (): CrudSchema => {
  return {
    // API 接口
    crudApi: {
      list: (params) => MenuService.getList(params),
      add: (data) => MenuService.create(data),
      edit: (data) => MenuService.update(data.id, data),
      remove: (id) => MenuService.remove(id),
      batchRemove: (ids) => MenuService.batchRemove(ids),
      view: (id) => MenuService.getDetail(id),
    },

    // 表格开关
    hasAdd: true,
    hasEdit: true,
    hasRemove: true,
    hasView: true,
    hasBatchRemove: true,

    // 权限配置
    permissions: {
      add: 'system:menu:create',
      edit: 'system:menu:update',
      remove: 'system:menu:delete',
      view: 'system:menu:read',
    },

    // 行 key
    rowKey: 'id',

    // 表格列
    columns: [ ... ],

    // 搜索表单
    searchForm: { ... },

    // 表单弹窗
    formDialog: { ... },

    // 数据处理钩子
    beforeFetch: (params) => ({
      ...params,
      tenant_id: 1,
    }),
  }
}
```

## 下一步

- [表格列定义](./columns.md) - 学习如何定义表格列
- [搜索表单配置](./search-form.md) - 配置搜索表单
- [表单弹窗配置](./form-dialog.md) - 配置新增/编辑/查看弹窗
