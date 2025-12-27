# Ecom AI App Hub

跨境电商AI工具集合 - 基于 Next.js App Router 的应用中心

## 功能特性

- ✅ **GitHub OAuth 登录**：使用 Auth.js (NextAuth) 实现安全的 GitHub 登录
- ✅ **白名单访问控制**：支持 GitHub 用户名和邮箱域名白名单，未配置白名单默认拒绝访问
- ✅ **N8N 工作流集成**：通过服务器网关安全调用 N8N 工作流
- ✅ **应用注册系统**：轻松添加新的迷你应用
- ✅ **响应式设计**：使用 Tailwind CSS 构建的现代化界面

## 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **认证**：Auth.js (NextAuth) v5
- **运行时**：Node.js

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：

#### 生成 AUTH_SECRET

```bash
openssl rand -base64 32
```

#### 配置 GitHub OAuth

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: Ecom AI App Hub
   - **Homepage URL**: `http://localhost:3000` (开发环境) 或您的生产域名
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 创建后获取 `Client ID` 和 `Client Secret`
5. 将它们填入 `.env.local` 的 `GITHUB_ID` 和 `GITHUB_SECRET`

#### 配置白名单

白名单配置采用**失败安全**机制：如果没有配置任何白名单，所有用户将被拒绝访问。

- **ALLOWED_GITHUB_LOGINS**：允许的 GitHub 用户名（逗号分隔）
  ```
  ALLOWED_GITHUB_LOGINS=alice,bob,charlie
  ```

- **ALLOWED_EMAIL_DOMAINS**：允许的邮箱域名（逗号分隔，可选）
  ```
  ALLOWED_EMAIL_DOMAINS=yourcompany.com,example.com
  ```

#### 配置 N8N

- **N8N_WEBHOOK_URL**：您的 N8N 实例 Webhook 地址
- **N8N_WEBHOOK_SECRET**（可选）：如果设置，将在请求头中发送 `x-n8n-secret`

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ecom-ai-app-hub)

### 手动部署

1. 在 [Vercel](https://vercel.com) 创建新项目
2. 导入您的 GitHub 仓库
3. 配置环境变量（参考上方"配置环境变量"章节）
4. 部署！

**重要提示**：部署后记得更新 GitHub OAuth App 的回调地址为您的生产域名：
```
https://your-domain.com/api/auth/callback/github
```

## 项目结构

```
ecom-ai-app-hub/
├── app/                      # Next.js App Router 页面
│   ├── api/
│   │   ├── auth/            # Auth.js 路由
│   │   └── n8n/
│   │       └── trigger/     # N8N 网关 API
│   ├── apps/
│   │   └── [slug]/          # 动态应用路由
│   ├── login/               # 登录页面
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页（应用中心）
│   └── globals.css          # 全局样式
├── apps/                     # 迷你应用目录
│   └── asin-keywords/       # ASIN关键词分析应用
│       └── App.tsx
├── lib/
│   └── registry.ts          # 应用注册表
├── auth.config.ts           # Auth.js 配置
├── auth.ts                  # Auth.js 导出
├── middleware.ts            # 访问控制中间件
└── CLAUDE.md                # 项目规则（AI助手指南）
```

## 添加新应用

按照以下步骤添加新的迷你应用：

### 1. 创建应用组件

在 `apps/<slug>/` 目录下创建 `App.tsx`：

```tsx
"use client";

import { useState } from "react";

export default function MyApp() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/n8n/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: "my-workflow",
        payload: { input },
      }),
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">提交</button>
      </form>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### 2. 注册应用

在 `lib/registry.ts` 的 `allApps` 数组中添加：

```typescript
{
  slug: "my-app",
  title: "我的应用",
  category: "工具分类",
  description: "应用描述",
}
```

### 3. 添加到路由

在 `app/apps/[slug]/page.tsx` 的 `appComponents` 中添加：

```typescript
import MyApp from "@/apps/my-app/App";

const appComponents: Record<string, React.ComponentType> = {
  "asin-keywords": AsinKeywordsApp,
  "my-app": MyApp,  // 添加这一行
};
```

### 4. 配置 N8N 工作流

在您的 N8N 实例中创建对应的工作流，确保：
- 工作流名称与 `workflow` 参数匹配
- 正确处理 `payload` 中的数据
- 返回 JSON 格式的结果

## 安全说明

### 前端安全

- ⚠️ **永远不要**在前端代码中放置任何第三方 API 密钥
- ✅ 所有外部 API 调用必须通过 `/api/n8n/trigger` 服务器网关

### 访问控制

- 所有页面默认需要登录，除了 `/login` 和 `/api/auth/*`
- 白名单采用**失败安全**机制：
  - 如果 `ALLOWED_GITHUB_LOGINS` 和 `ALLOWED_EMAIL_DOMAINS` 都未配置，所有用户将被拒绝
  - 只有在白名单中的用户才能访问系统
- 中间件在每个请求时验证用户权限

### N8N 集成

- 使用环境变量 `N8N_WEBHOOK_SECRET` 保护 N8N 端点
- 所有 N8N 请求都通过服务器端发送，客户端无法直接访问

## 常见问题

### 登录后显示"未授权"

检查您的 GitHub 用户名或邮箱是否在白名单中：
- 查看 `.env.local` 中的 `ALLOWED_GITHUB_LOGINS` 和 `ALLOWED_EMAIL_DOMAINS`
- 确保白名单已正确配置

### N8N 请求失败

1. 检查 `N8N_WEBHOOK_URL` 是否正确
2. 确认 N8N 实例可以从您的服务器访问
3. 如果设置了 `N8N_WEBHOOK_SECRET`，确保 N8N 端点需要该密钥
4. 查看服务器日志获取详细错误信息

### 构建失败

确保：
- 所有 TypeScript 类型正确
- 没有未使用的导入
- 运行 `npm run build` 查看具体错误

## 开发指南

### TypeScript 要求

- 项目使用严格模式的 TypeScript
- 所有代码必须通过类型检查
- 部署前必须确保 `npm run build` 成功

### 代码规范

- 使用 Next.js App Router 约定
- 交互式组件使用 `"use client"` 指令
- 服务器操作使用 `"use server"` 指令
- 遵循 React 最佳实践

## 许可证

MIT

## 支持

如有问题，请在 GitHub 仓库创建 Issue。
