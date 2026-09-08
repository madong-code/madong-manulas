# Install 6步安装流程详解

## 概述

Install 包含 6 个安装步骤，每一步通过 `installStore` 共享状态，安装执行通过 SSE 实时获取进度。

## 安装步骤流程

```
agreement → environment → database → config → tenant → complete
  协议       环境检测     数据库配置   管理员    多租户    完成
```

## 步骤1：协议确认（agreement-step）

### 组件位置

```
apps/install/src/components/agreement-step/
```

### 功能说明

- 显示软件许可协议
- 用户必须勾选"我已阅读并同意协议"才能继续

### 组件结构

```vue
<!-- apps/install/src/components/agreement-step/index.vue -->
<script setup lang="ts">
import { useInstallStore } from '@/store/module/install';

const installStore = useInstallStore();

// Fetch agreement data on mounted
onMounted(async () => {
  await installStore.fetchAgreementData();
});
</script>

<template>
  <div class="agreement-step">
    <el-checkbox v-model="agreed">我已阅读并同意协议</el-checkbox>
    <el-button :disabled="!agreed" @click="nextStep()">下一步</el-button>
  </div>
</template>
```

### Store 数据

```typescript
// apps/install/src/store/module/install.ts
state: () => ({
  agreementData: null, // Agreement content
  // ...
}),
actions: {
  async fetchAgreementData() {
    const data = await installApi.getAgreement();
    this.agreementData = data;
  },
  // ...
},
```

## 步骤2：环境检测（environment-step）

### 组件位置

```
apps/install/src/components/environment-step/
```

### 功能说明

- 检测 PHP 版本、扩展、目录权限等
- 显示检测结果，全部通过才能继续

### 组件结构

```vue
<!-- apps/install/src/components/environment-step/index.vue -->
<script setup lang="ts">
import { useInstallStore } from '@/store/module/install';

const installStore = useInstallStore();

// Check environment on mounted
onMounted(async () => {
  await installStore.checkEnvironment();
});
</script>

<template>
  <div class="environment-step">
    <el-table :data="installStore.environmentData.check_items">
      <el-table-column prop="name" label="检测项" />
      <el-table-column prop="status" label="状态" />
    </el-table>
    <el-button :disabled="!installStore.environmentPassed" @click="nextStep()">下一步</el-button>
  </div>
</template>
```

### Store 数据

```typescript
// apps/install/src/store/module/install.ts
state: () => ({
  environmentData: {
    check_items: [],
    directory_check_items: [],
    passed: false,
    loading: false,
  },
  // ...
}),
getters: {
  environmentPassed: (state) => {
    return state.environmentData.passed;
  },
  // ...
},
actions: {
  async checkEnvironment() {
    this.environmentData.loading = true;
    const data = await installApi.checkEnvironment();
    this.environmentData = data;
    this.environmentData.loading = false;
  },
  // ...
},
```

## 步骤3：数据库配置（database-step）

### 组件位置

```
apps/install/src/components/database-step/
```

### 功能说明

- 配置数据库连接信息
- 测试数据库连接

### 组件结构

```vue
<!-- apps/install/src/components/database-step/index.vue -->
<script setup lang="ts">
import { useInstallStore } from '@/store/module/install';

const installStore = useInstallStore();

// Test database connection
const testConnection = async () => {
  await installApi.testDatabaseConnection(installStore.databaseConfig);
};
</script>

<template>
  <div class="database-step">
    <el-form :model="installStore.databaseConfig">
      <el-form-item label="数据库主机">
        <el-input v-model="installStore.databaseConfig.host" />
      </el-form-item>
      <el-form-item label="数据库端口">
        <el-input v-model="installStore.databaseConfig.port" />
      </el-form-item>
      <el-form-item label="数据库用户名">
        <el-input v-model="installStore.databaseConfig.username" />
      </el-form-item>
      <el-form-item label="数据库密码">
        <el-input v-model="installStore.databaseConfig.password" type="password" />
      </el-form-item>
      <el-form-item label="数据库名称">
        <el-input v-model="installStore.databaseConfig.database" />
      </el-form-item>
      <el-form-item label="表前缀">
        <el-input v-model="installStore.databaseConfig.prefix" />
      </el-form-item>
    </el-form>
    <el-button @click="testConnection()">测试连接</el-button>
    <el-button @click="nextStep()">下一步</el-button>
  </div>
</template>
```

### Store 数据

```typescript
// apps/install/src/store/module/install.ts
state: () => ({
  databaseConfig: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'madong',
    prefix: 'md_',
  },
  // ...
}),
```

## 步骤4：管理员配置（config-step）

### 组件位置

```
apps/install/src/components/config-step/
```

### 功能说明

- 配置管理员账号信息
- 配置站点信息

### 组件结构

```vue
<!-- apps/install/src/components/config-step/index.vue -->
<script setup lang="ts">
import { useInstallStore } from '@/store/module/install';

const installStore = useInstallStore();
</script>

<template>
  <div class="config-step">
    <el-form :model="installStore.adminConfig">
      <el-form-item label="管理员用户名">
        <el-input v-model="installStore.adminConfig.username" />
      </el-form-item>
      <el-form-item label="管理员密码">
        <el-input v-model="installStore.adminConfig.password" type="password" />
      </el-form-item>
      <el-form-item label="管理员邮箱">
        <el-input v-model="installStore.adminConfig.email" />
      </el-form-item>
      <el-form-item label="站点名称">
        <el-input v-model="installStore.adminConfig.site_name" />
      </el-form-item>
    </el-form>
    <el-button @click="nextStep()">下一步</el-button>
  </div>
</template>
```

### Store 数据

```typescript
// apps/install/src/store/module/install.ts
state: () => ({
  adminConfig: {
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    site_name: 'Madong SaaS',
    // ...
  },
  // ...
}),
```

## 步骤5：多租户配置（tenant-step）

### 组件位置

```
apps/install/src/components/tenant-step/
```

### 功能说明

- 配置多租户模式
- 是否创建默认租户

### 组件结构

```vue
<!-- apps/install/src/components/tenant-step/index.vue -->
<script setup lang="ts">
import { useInstallStore } from '@/store/module/install';

const installStore = useInstallStore();
</script>

<template>
  <div class="tenant-step">
    <el-form :model="installStore.tenantConfig">
      <el-form-item label="租户模式">
        <el-radio-group v-model="installStore.tenantConfig.tenant_mode">
          <el-radio label="none">无租户</el-radio>
          <el-radio label="single">单租户</el-radio>
          <el-radio label="multi">多租户</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="启用多租户">
        <el-switch v-model="installStore.tenantConfig.enable_tenant" />
      </el-form-item>
      <el-form-item label="创建默认租户">
        <el-switch v-model="installStore.tenantConfig.create_default_tenant" />
      </el-form-item>
    </el-form>
    <el-button @click="nextStep()">下一步</el-button>
  </div>
</template>
```

### Store 数据

```typescript
// apps/install/src/store/module/install.ts
state: () => ({
  tenantConfig: {
    tenant_mode: 'none',
    enable_tenant: false,
    create_default_tenant: false,
    // ...
  },
  // ...
}),
```

## 步骤6：安装完成（complete-step）

### 组件位置

```
apps/install/src/components/complete-step/
```

### 功能说明

- 显示安装结果
- 显示安装耗时
- 提供"进入系统"按钮

### 组件结构

```vue
<!-- apps/install/src/components/complete-step/index.vue -->
<script setup lang="ts">
import { useInstallStore } from '@/store/module/install';

const installStore = useInstallStore();

// Navigate to admin
const goToAdmin = () => {
  window.location.href = '/admin';
};
</script>

<template>
  <div class="complete-step">
    <el-result icon="success" title="安装完成">
      <template #sub-title>
        <p>安装耗时：{{ installStore.formattedDuration }}</p>
      </template>
      <template #extra>
        <el-button type="primary" @click="goToAdmin()">进入系统</el-button>
      </template>
    </el-result>
  </div>
</template>
```

### Store 数据

```typescript
// apps/install/src/store/module/install.ts
state: () => ({
  install_progress: 0,
  install_logs: [] as string[],
  install_status: 'idle' as 'error' | 'idle' | 'installing' | 'success',
  install_start_time: null as Date | null,
  installation_completed: false,
  // ...
}),
getters: {
  installDuration: (state) => {
    if (!state.install_start_time) return 0;
    return Date.now() - new Date(state.install_start_time).getTime();
  },
  formattedDuration: (state) => {
    const duration = this.installDuration;
    return `${Math.round(duration / 1000)}秒`;
  },
  // ...
},
```

## 安装执行（SSE 实时进度）

### Store 动作

```typescript
// apps/install/src/store/module/install.ts
actions: {
  async simulateInstallation() {
    // 1. Build SSE URL (include all config params)
    const params = new URLSearchParams({
      database_host: this.databaseConfig.host,
      database_port: String(this.databaseConfig.port),
      database_username: this.databaseConfig.username,
      database_password: this.databaseConfig.password,
      database_name: this.databaseConfig.database,
      database_prefix: this.databaseConfig.prefix,
      admin_username: this.adminConfig.username,
      admin_password: this.adminConfig.password,
      admin_email: this.adminConfig.email,
      site_name: this.adminConfig.site_name,
      tenant_mode: this.tenantConfig.tenant_mode,
      enable_tenant: String(this.tenantConfig.enable_tenant),
      create_default_tenant: String(this.tenantConfig.create_default_tenant),
    });
    const sseUrl = `/adminapi/install/execute?${params.toString()}`;

    // 2. Create EventSource connection
    const eventSource = new EventSource(sseUrl);

    // 3. Listen to progress/runtime_error/completed events
    eventSource.addEventListener('progress', (event) => {
      const data = JSON.parse(event.data);
      this.updateProgress(data.progress, data.log);
    });

    eventSource.addEventListener('completed', (event) => {
      const data = JSON.parse(event.data);
      this.installComplete();
      eventSource.close();
    });

    eventSource.addEventListener('runtime_error', (event) => {
      const data = JSON.parse(event.data);
      this.installFailed(data.message);
      eventSource.close();
    });
  },

  updateProgress(progress, log) {
    this.install_progress = progress;
    this.install_logs.push(log);
  },

  installComplete() {
    this.install_status = 'success';
    this.installation_completed = true;
  },

  installFailed(error) {
    this.install_status = 'error';
    this.install_logs.push(`错误：${error}`);
  },
  // ...
},
```

## 下一步

- [Admin 应用介绍](../admin/intro.md) - 了解 Admin 应用
- [Platform 应用介绍](../platform/intro.md) - 了解 Platform 应用
