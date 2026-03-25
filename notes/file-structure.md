# File Structure

## 总览

```
src/
├── app/                    # Next.js App Router：路由入口
│   ├── api/                # API 路由
│   ├── login/
│   ├── onboarding/
│   ├── profile/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── features/               # 业务功能模块
│   ├── onboarding/
│   └── profile/
├── components/             # 通用 UI 组件
├── db/                     # 数据库配置与 Schema
├── lib/                    # 第三方服务初始化
├── auth.ts                 # NextAuth 主配置
├── auth.config.ts          # NextAuth Edge 兼容配置
└── proxy.ts                # 开发环境代理配置
```

---

## 设计原则：路由与业务逻辑分离

Next.js App Router 要求页面文件必须放在 `app/` 下，但这不意味着所有代码都应该堆在那里。本项目遵循一个核心原则：

> **`app/` 只做两件事：接收请求、返回响应。业务逻辑全部放在 `features/` 里。**

`app/[route]/page.tsx` 的职责只有：
1. 验证登录状态（未登录则 redirect）
2. 从数据库取数据
3. 把数据传给 `features/` 里的组件渲染

所有 UI、状态管理、交互逻辑都在 `features/` 里。

---

## 各目录详解

### `app/`

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts   # NextAuth OAuth 回调
│   ├── profile/route.ts              # GET / POST / PATCH 用户档案
│   ├── generate-meal-ideas/route.ts  # POST 调用 OpenAI 生成餐食建议
│   └── meal-ideas/route.ts           # GET / POST 保存/读取餐食建议
├── login/page.tsx                    # 登录页（纯展示）
├── onboarding/page.tsx               # Onboarding 路由入口
├── profile/page.tsx                  # Profile 路由入口
└── page.tsx                          # 首页
```

`api/` 下每个子目录对应一个资源（profile、meal-ideas），每个 `route.ts` 里用具名导出（`GET`、`POST`、`PATCH`）区分 HTTP 方法。

### `features/`

业务功能按模块划分，每个模块内部结构一致：

```
features/
├── onboarding/
│   ├── components/     # 该功能的所有 UI 组件
│   ├── hooks/          # 自定义 React Hooks（状态与副作用）
│   ├── utils/          # 纯函数（如营养计算）
│   ├── types.ts        # 该模块的 TypeScript 类型
│   └── config.ts       # 静态配置数据（步骤定义等）
└── profile/
    ├── components/     # ProfileContent、各卡片组件
    └── types.ts        # DBProfile、DBNutrition、UserInfo
```

这种结构的好处：
- **内聚性**：一个功能的所有代码在同一个目录下，改 onboarding 就只看 `features/onboarding/`
- **可移植性**：整个模块可以独立移动或删除，不会影响其他模块
- **避免全局污染**：模块专属的类型、工具函数不会混入全局命名空间

### `components/`

```
components/
├── LoginButton.tsx     # Google 登录按钮
└── SignOutButton.tsx   # 登出按钮
```

只放**完全通用、无业务逻辑**的 UI 组件——即任何页面都可能复用、不依赖具体业务数据的组件。有业务含义的组件（比如只在 profile 页用的卡片）放在对应的 `features/` 模块里。

### `db/`

```
db/
├── schema.ts   # 所有表的 Drizzle ORM 定义（users、user_profiles、nutrition_results、meal_ideas）
└── index.ts    # 数据库连接实例（Neon serverless）
```

Schema 集中管理，所有 API 路由直接 import `db` 和表定义，不做任何封装层。现阶段数据访问逻辑简单，不需要 Repository 模式。

### `lib/`

```
lib/
└── openai.ts   # OpenAI 客户端初始化
```

放第三方 SDK 的初始化代码。统一在这里创建单例，避免在每个用到的地方重复配置。

### `auth.ts` / `auth.config.ts`

NextAuth v5 要求把 Edge Runtime 兼容的配置（providers、回调）单独放在 `auth.config.ts`，完整配置（含数据库 adapter）放在 `auth.ts`。两个文件各自导出，中间件用 `auth.config.ts`，API 路由和服务端组件用 `auth.ts`。

---

## 数据流向

```
浏览器请求
    │
    ▼
app/[route]/page.tsx        ← Server Component，验证登录 + 查数据库
    │
    ▼
features/[module]/components/Content.tsx   ← Client Component，管理交互状态
    │
    ├── 展示型子组件（NutritionCard、ProfileHeader 等，纯 props）
    │
    └── fetch("/api/...")   ← 用户操作触发，调用 API 路由修改数据
            │
            ▼
        app/api/[resource]/route.ts   ← 验证、计算、写数据库
```
