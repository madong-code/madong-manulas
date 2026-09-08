# 表格列定义

## 基本结构

表格列通过 `columns` 配置项定义，支持数组和函数两种形式：

```typescript
// 数组形式
columns: [
  { type: 'checkbox', width: 60 },
  { field: 'title', title: '标题', align: 'left' },
]

// 函数形式（支持动态计算）
columns: () => [
  { type: 'checkbox', width: 60 },
  { field: 'title', title: $t('common.title'), align: 'left' },
]
```

## CrudColumn 类型定义

```typescript
export interface CrudColumn {
  // 基础属性
  field?: string          // 字段名
  title?: string         // 显示标题
  width?: number | string  // 列宽度
  minWidth?: number | string // 最小宽度
  type?: string          // 列类型（'checkbox' | 'seq' | 'expand' | 'radio'）
  visible?: boolean      // 是否可见

  // 对齐方式
  align?: 'center' | 'left' | 'right'

  // 权限控制
  auth?: string          // 权限标识

  // 自定义渲染
  cellRender?: {        // 单元格渲染器
    name: string         // 渲染器名称
    attrs?: Record<string, any>  // 渲染器属性
    props?: Record<string, any>  // 渲染器属性（别名）
  }
  viewComponent?: any    // 查看模式组件
  viewComponentProps?: Record<string, any>  // 查看模式组件属性

  // 插槽
  slots?: {             // 自定义插槽
    default: (params: any) => any
  }

  // 格式化
  formatter?: string | Function  // 格式化函数或名称

  // VxeTable 原生配置
  vxeColumn?: Record<string, any>  // 透传给 VxeTable 的列配置

  // 其他属性
  [key: string]: any
}
```

## 常用列类型

### 1. 选择列

```typescript
{ type: 'checkbox', width: 60 }  // 多选框
{ type: 'radio', width: 60 }    // 单选框
{ type: 'seq', width: 60 }      // 序号列
```

### 2. 数据列

```typescript
{
  field: 'title',
  title: $t('common.title'),
  align: 'left',
  minWidth: 200,
}
```

### 3. 字典标签列

使用 `cellRender` 渲染字典标签：

```typescript
{
  field: 'status',
  title: $t('common.status'),
  width: 100,
  cellRender: {
    name: 'CellDictTag',
    attrs: { code: DictEnum.SYS_ENABLED_STATUS },
  },
}
```

### 4. 自定义渲染列（JSX）

使用 `cellRender` 函数渲染自定义内容：

```typescript
{
  field: 'title',
  title: $t('common.title'),
  align: 'left',
  minWidth: 200,
  // 使用 JSX 自定义渲染
  cellRender: ({ row }) => {
    return (
      <div class="flex items-center gap-2">
        <img src={row.icon} class="size-8 rounded" />
        <span class="font-medium">{row.title}</span>
        {row.installed_at && (
          <ElTag effect="dark" size="small" type="success">
            已安装
          </ElTag>
        )}
      </div>
    )
  },
}
```

### 5. 插槽列

使用 `slots` 自定义列内容：

```typescript
{
  field: 'installed_at',
  title: $t('plugin.install_status'),
  width: 140,
  slots: {
    default: ({ row }) => {
      const installed = !!row.installed_at
      return (
        <div class="inline-flex items-center gap-1">
          <ElTag effect={installed ? 'dark' : 'plain'} type={installed ? 'success' : 'info'}>
            {installed ? '已安装' : '未安装'}
          </ElTag>
        </div>
      )
    },
  },
}
```

### 6. 格式化列

使用 `formatter` 格式化内容：

```typescript
{
  field: 'created_at',
  title: $t('common.created_at'),
  width: 180,
  formatter: 'formatDateTime',  // 使用内置格式化函数
}
```

## 实际示例

参考 `app/plugin/develop/schemas/index.tsx`：

```typescript
columns: [
  { type: 'checkbox', width: 60 },

  // 标题列（自定义渲染：图标 + 名称 + 标签）
  {
    field: 'title',
    title: $t('app.plugin.develop.list.title'),
    align: 'left',
    minWidth: 200,
    cellRender: ({ row }) => {
      return (
        <div class="flex items-center gap-2">
          {row.icon ? (
            <img alt="" class="size-8 shrink-0 rounded-sm object-cover" src={row.icon} />
          ) : (
            <span class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gray-100 text-base">
              📦
            </span>
          )}
          <span class="font-medium">{row.title}</span>
          {row.installed_at ? (
            <ElTag effect="dark" round size="small" type="success">
              已安装
            </ElTag>
          ) : null}
        </div>
      )
    },
  },

  // 标识列
  {
    field: 'key',
    title: $t('app.plugin.develop.list.key'),
    minWidth: 120,
    align: 'left',
  },

  // 状态列（字典标签）
  {
    field: 'status',
    title: $t('app.plugin.develop.list.status'),
    width: 100,
    cellRender: {
      name: 'CellDictTag',
      attrs: { code: DictEnum.SYS_ENABLED_STATUS },
    },
  },

  // 时间列（格式化）
  {
    field: 'created_at',
    title: $t('app.plugin.develop.list.created_at'),
    width: 180,
    formatter: 'formatDateTime',
    visible: false,  // 默认隐藏
  },
],
```

## 常用 cellRender 渲染器

### CellDictTag

渲染字典标签：

```typescript
{
  cellRender: {
    name: 'CellDictTag',
    attrs: { code: 'sys_enabled_status' },
  }
}
```

### 其他渲染器

根据 `template/mono/apps/admin/src/components/crud/components/viewer/component-map.ts` 查看所有支持的渲染器。

## 下一步

- [搜索表单配置](./search-form.md) - 配置搜索表单
- [表单弹窗配置](./form-dialog.md) - 配置新增/编辑/查看弹窗
- [操作按钮配置](./actions.md) - 配置操作按钮
