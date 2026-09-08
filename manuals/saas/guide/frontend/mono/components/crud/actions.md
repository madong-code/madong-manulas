# 操作按钮配置

## 按钮位置

CRUD 组件支持在以下位置配置操作按钮：

| 位置 | 配置项 | 说明 |
|------|---------|------|
| 表格行内 | `tableActions` | 表格行内的操作按钮（如：编辑、删除） |
| 表格行内下拉 | `dropDownActions` | 表格行内的下拉菜单按钮 |
| 工具栏 | `toolbarActions` | 表格工具栏的操作按钮（如：新增） |
| 工具栏下拉 | `dropDownToolbarActions` | 表格工具栏的下拉菜单按钮 |

## ActionItem 类型定义

```typescript
export interface ActionItem {
  // 按钮文本
  label?: string

  // 按钮图标
  icon?: string

  // 权限标识（控制按钮显示）
  auth?: string

  // 点击事件
  onClick?: (e: Event, row: any) => void

  // 按钮类型
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'

  // 是否显示弹出确认框
  popConfirm?: PopConfirm

  // 是否禁用
  disabled?: boolean | ((row: any) => boolean)

  // 是否显示
  show?: boolean | ((row: any) => boolean)
}
```

## PopConfirm 类型定义

```typescript
export interface PopConfirm {
  title: string           // 确认框标题
  description?: string    // 确认框描述
  confirmText?: string    // 确认按钮文本
  cancelText?: string     // 取消按钮文本
  type?: 'warning' | 'info' | 'error' | 'success'
}
```

## 表格行操作按钮（tableActions）

显示在表格每一行的操作列中：

```typescript
{
  tableActions: [
    // 编辑按钮
    {
      label: $t('common.edit'),
      icon: 'ant-design:edit-outlined',
      auth: 'system:menu:update',  // 权限控制
      onClick: (e: Event, row: any) => {
        // 打开编辑弹窗
        crudApi.openEditDialog(row)
      },
    },

    // 删除按钮（带确认框）
    {
      label: $t('common.delete'),
      icon: 'ant-design:delete-outlined',
      type: 'danger',
      auth: 'system:menu:delete',
      popConfirm: {
        title: $t('common.confirm_delete'),
        description: $t('common.confirm_delete_description'),
        confirmText: $t('common.confirm'),
        cancelText: $t('common.cancel'),
        type: 'warning',
      },
      onClick: (e: Event, row: any) => {
        crudApi.removeByApi(row)
      },
    },
  ],
}
```

## 表格行下拉操作（dropDownActions）

显示在表格每一行的下拉菜单中：

```typescript
{
  dropDownActions: [
    {
      label: $t('app.plugin.develop.action.package'),
      icon: 'ant-design:download-outlined',
      auth: 'plugin:develop:build',
      onClick: async (e: Event, row: any) => {
        await handlePackage(row)
      },
    },
  ],
}
```

## 工具栏操作按钮（toolbarActions）

显示在表格工具栏中：

```typescript
{
  toolbarActions: [
    // 新增按钮
    {
      label: $t('common.add'),
      icon: 'ant-design:plus-outlined',
      type: 'primary',
      auth: 'system:menu:create',
      onClick: () => {
        crudApi.openAddDialog()
      },
    },
  ],
}
```

## 工具栏下拉操作（dropDownToolbarActions）

显示在表格工具栏的下拉菜单中：

```typescript
{
  dropDownToolbarActions: [
    {
      label: $t('common.export'),
      icon: 'ant-design:export-outlined',
      auth: 'system:menu:export',
      onClick: () => {
        handleExport()
      },
    },
  ],
}
```

## 完整示例

参考 `app/plugin/develop/index.vue`：

```typescript
const [BasicCrud] = useCrud({
  ...useCrudSchema(),

  // 表格行操作按钮（清空，使用默认配置）
  tableActions: [],

  // 表格行下拉操作（自定义）
  dropDownActions: [
    {
      label: $t('app.plugin.develop.action.package'),
      icon: 'ant-design:download-outlined',
      auth: 'plugin:develop:build',
      onClick: async (_e: Event, row: any) => {
        try {
          await ElMessageBox.confirm(
            $t('app.plugin.develop.action.package_confirm_message'),
            $t('app.plugin.develop.action.package_confirm_title'),
            {
              confirmButtonText: $t('app.plugin.develop.action.package_confirm'),
              cancelButtonText: $t('app.plugin.develop.action.package_cancel'),
              type: 'warning',
            },
          )

          const res: any = await AppPluginDevelopService.build(row.id)
          // 处理打包结果...
        } catch {
          // 用户取消操作
        }
      },
    },
  ],

  // 工具栏按钮（清空，使用默认配置）
  toolbarActions: [],
  dropDownToolbarActions: [],
})
```

## 默认按钮

如果未配置 `tableActions`、`toolbarActions` 等，CRUD 组件会根据 `hasAdd`、`hasEdit`、`hasRemove` 等配置自动生成默认按钮：

- `hasAdd: true` → 自动生成新增按钮（工具栏）
- `hasEdit: true` → 自动生成编辑按钮（表格行）
- `hasRemove: true` → 自动生成删除按钮（表格行）
- `hasView: true` → 自动生成查看按钮（表格行）
- `hasBatchRemove: true` → 自动生成批量删除按钮（工具栏）

## 下一步

- [CrudApiInstance API](./api.md) - 了解编程式操作 API
- [完整示例](./overview.md) - 查看完整的代码示例
