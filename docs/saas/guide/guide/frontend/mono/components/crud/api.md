# CrudApiInstance API

`CrudApiInstance` 是通过 `useCrud()` 返回的第二个元素，提供编程式操作表格的 API。

## 获取实例

```typescript
const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
})
```

## API 方法

### 数据操作

#### query(params?)

刷新表格数据（保留当前分页）：

```typescript
crudApi.query({ keyword: 'test' })
```

#### reload(params?)

重新加载表格数据（回到第一页）：

```typescript
crudApi.reload()
```

#### setLoading(loading)

设置表格加载状态：

```typescript
crudApi.setLoading(true)
// ... 异步操作
crudApi.setLoading(false)
```

#### getGridInstance()

获取 VxeTable 实例：

```typescript
const grid = crudApi.getGridInstance()
grid.setFilter('field', [])  // 调用 VxeTable API
```

#### getFormApi()

获取搜索表单 API：

```typescript
const formApi = crudApi.getFormApi()
formApi.resetForm()  // 重置搜索表单
```

#### getRowSelection()

获取当前选中的行数据：

```typescript
const selectedRows = crudApi.getRowSelection()
console.log(selectedRows)
```

#### getReadonlyState()

获取只读状态（包含 selection）：

```typescript
const state = crudApi.getReadonlyState()
console.log(state.selection)
```

### 刷新数据

#### refreshData()

刷新数据（回到第一页）：

```typescript
crudApi.refreshData()
```

#### refreshSoft()

软刷新（保留当前分页和筛选条件）：

```typescript
crudApi.refreshSoft()
```

#### refreshCreate()

新增后刷新（回到第一页）：

```typescript
crudApi.refreshCreate()
```

#### refreshUpdate()

编辑后刷新（保留当前分页）：

```typescript
crudApi.refreshUpdate()
```

#### refreshRemove()

删除后刷新（自动处理分页）：

```typescript
crudApi.refreshRemove()
```

### 弹窗操作

#### openAddDialog(data?)

打开新增弹窗：

```typescript
crudApi.openAddDialog()
crudApi.openAddDialog({ status: 1 })  // 带默认值
```

#### openEditDialog(row)

打开编辑弹窗：

```typescript
crudApi.openEditDialog(row)
```

#### openViewDialog(row)

打开查看弹窗：

```typescript
crudApi.openViewDialog(row)
```

### 删除操作

#### removeByApi(row)

删除指定行（带确认框）：

```typescript
crudApi.removeByApi(row)
```

#### executeRemove(row)

执行删除（不带确认框）：

```typescript
crudApi.executeRemove(row)
```

#### executeBatchRemove()

执行批量删除（带确认框）：

```typescript
crudApi.executeBatchRemove()
```

### 动态更新配置

#### setGridOptions(options)

动态更新 VxeGrid 选项：

```typescript
crudApi.setGridOptions({
  height: 500,
  border: true,
})
```

## 完整示例

### 示例 1：新增后刷新

```typescript
const handleCustomAdd = async () => {
  // 自定义新增逻辑
  await customAddApi(data)

  // 刷新表格（回到第一页）
  crudApi.refreshCreate()
}
```

### 示例 2：编辑后刷新

```typescript
const handleCustomEdit = async (row: any) => {
  // 自定义编辑逻辑
  await customEditApi(row.id, data)

  // 刷新表格（保留当前分页）
  crudApi.refreshUpdate()
}
```

### 示例 3：获取选中行

```typescript
const handleBatchOperation = () => {
  const selectedRows = crudApi.getRowSelection()

  if (selectedRows.length === 0) {
    ElMessage.warning($t('common.no_selection'))
    return
  }

  // 处理选中行...
  console.log(selectedRows)
}
```

### 示例 4：自定义搜索

```typescript
const handleSearch = (keyword: string) => {
  crudApi.query({ keyword })
}
```

### 示例 5：重置搜索

```typescript
const handleReset = () => {
  const formApi = crudApi.getFormApi()
  formApi.resetForm()
  crudApi.reload()
}
```

## 类型定义

```typescript
export interface CrudApiInstance {
  // 数据操作
  query: (params?: Record<string, any>) => Promise<void>
  reload: (params?: Record<string, any>) => Promise<void>
  setLoading: (loading: boolean) => void
  getGridInstance: () => any
  getFormApi: () => any
  getRowSelection: () => any[]
  getReadonlyState: () => CrudReadonlyState

  // 刷新数据
  refreshData: () => void
  refreshSoft: () => void
  refreshCreate: () => void
  refreshUpdate: () => void
  refreshRemove: () => void

  // 弹窗操作
  openAddDialog: (data?: Record<string, any>) => void
  openEditDialog: (row: any) => void
  openViewDialog: (row: any) => void

  // 删除操作
  removeByApi: (row: any) => void
  executeRemove: (row: any) => void
  executeBatchRemove: () => void

  // 动态更新配置
  setGridOptions: (options: Record<string, any>) => void
}
```

## 下一步

- [完整示例](./overview.md) - 查看完整的代码示例
- [常见问题](./overview.md) - 查看常见问题解答
