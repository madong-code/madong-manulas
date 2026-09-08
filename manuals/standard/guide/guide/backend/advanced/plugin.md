# 应用插件

后端插件机制基于 Webman 的插件规范：**Webman 启动时自动扫描 `backend/plugin/` 目录并注册路由与配置**，无需手动引入。

> 重要：运行时后端只读取 `backend/plugin/`。`madong-market/*` 或 `template/*` 里的同名目录只是插件**模板源/安装包**，重新安装/同步时才会写入运行时目录，两边内容需保持一致。

## 目录约定

```
backend/plugin/
└── {plugin_name}/
    ├── config/
    │   ├── route.php        # 插件路由（按 Webman 插件规范）
    │   ├── review.php       # 审核类型扩展（可选）
    │   └── ...              # 其它配置（自动被系统扫描合并）
    ├── app/                 # 插件业务代码（controller/service/dao/model...）
    ├── api/                 # 对外 HTTP 接口
    ├── resource/            # 资源（迁移、语言包、数据）
    └── ...
```

## 插件如何被加载

1. Webman 启动（`start.php` / `windows.php`）扫描 `backend/plugin/` 下每个子目录。
2. 读取 `config/route.php` 注册路由；读取 `config/*.php` 合并进全局配置（如 `review.php` 的 `scan_plugins`）。
3. 插件业务类遵循与核心一致的 PSR-4 自动加载。

## 审核类型扩展（插件示例）

`config/review.php` 在系统侧 `scan_plugins => true` 时，会自动扫描各插件 `config/review.php` 并合并 `types` 与 `field_mappings`。例如官方插件在 `plugin/official/config/review.php` 中声明 `question` 审核类型，无需改核心。

## 新建插件

1. 在 `backend/plugin/` 下建立 `{plugin_name}/` 目录结构。
2. 编写 `config/route.php` 定义路由（参考 Webman 插件路由规范）。
3. 在 `app/` 下按四层架构组织业务代码（Controller→Service→Dao→Model）。
4. 如需扩展系统能力（如审核类型），在 `config/{feature}.php` 提供与系统一致的键结构，系统自动合并。
5. 重启后端使插件生效（`php start.php restart`）。

> 注意：插件后端代码必须放在 `backend/plugin/` 下，否则请求会 404；同时确保与模板源保持同步以便重新安装。
