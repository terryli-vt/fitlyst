# 整体数据流

```
用户点 "Continue with Google"
  → Server Action 调 signIn("google")
  → 重定向到 Google 授权页
  → 用户同意
  → Google 回调 /api/auth/callback/google
  → NextAuth 用 Drizzle Adapter 查/创建 users 表记录
  → 在 accounts 表写入绑定关系
  → 在 sessions 表创建 session，种 cookie
  → 重定向到 /onboarding
```

# 安装包

`npm install next-auth@beta @auth/drizzle-adapter`

- `next-auth@beta` — 这是 NextAuth v5（也叫 Auth.js），专门为 Next.js App Router 重写的版本。v4 是给 Pages Router 设计的，用在 App Router 上会有很多摩擦。
- `@auth/drizzle-adapter` — 让 NextAuth 知道怎么用 Drizzle + NeonDB 来存储用户、session 等数据，否则 NextAuth 默认把数据存在内存里，服务重启就全没了。

# 更新 `schema.ts`

这是改动最多的地方，分两部分：

## 给 `users` 表加字段

原来的 `users` 只有 `id`、`email`、`createdAt`。NextAuth 在创建用户时会自动写入 `name`、`image`、`emailVerified`，如果这些列不存在，写入就会报错。

```
name: text("name"), // Google 账号的显示名
image: text("image"), // 头像 URL
emailVerified: timestamp(...) // 邮箱验证时间（OAuth 登录时会自动填）
```

另外原来的 `id` 没有默认值，NextAuth adapter 在创建用户时会传入自己生成的 UUID，但为了更健壮，我加了：

```
.$defaultFn(() => crypto.randomUUID())
```

`$defaultFn` 是 Drizzle 的功能，在插入新行时自动生成默认值。

这里传入的函数是 `() => crypto.randomUUID()`，每次插入新用户时自动生成一个随机的 UUID 字符串，比如：

`"550e8400-e29b-41d4-a716-446655440000"`
作为这一行的 `id`。

这样不管是 NextAuth 创建还是你自己代码创建，id 都有保障。

## 新增三张 NextAuth 必须的表

### `accounts` 表 — 存 OAuth 账号绑定关系。

一个用户可以绑多个登录方式（比如 Google + GitHub），这张表就是记录"某个用户绑定了哪些第三方账号"。每行是一个绑定关系，有 `provider`（`google`）、`providerAccountId`（Google 那边的用户 ID）、`access_token` 等。这也是为什么加 provider 那么容易——新 provider 的账号自动存进同一张表，用 `provider` 字段区分。

### `sessions` 表 — 存登录 session。

用户登录后，NextAuth 生成一个 `sessionToken`（随机字符串），存到这张表并种到用户浏览器的 cookie 里。每次请求来了，NextAuth 用 cookie 里的 token 查这张表，确认用户身份和 session 是否过期。

### `verificationTokens` 表 — 存验证用的临时 token。

主要给 Magic Link 用的（发邮件那种）。虽然你现在只用 Google OAuth 不需要它，但 Drizzle Adapter 要求这张表必须存在，否则启动时会报错。留着也不占空间，以后加 Magic Link 直接就能用

# `src/auth.ts` — 核心配置

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, { ... }),
    providers: [Google],
    pages: { signIn: "/login" },
});
```

这里导出四个东西，各司其职：

- `handlers` — HTTP handler，交给 API 路由用
- `auth` — 在 Server Component 里调用，获取当前用户的 session
- `signIn` / `signOut` — 在 Server Action 里触发登录/登出

`providers` 数组就是可扩展性的关键。以后加 GitHub 只需：

```
import GitHub from "next-auth/providers/github"
providers: [Google, GitHub]
```

`pages: { signIn: "/login" }` — 告诉 NextAuth 登录页在哪。如果不设，NextAuth 会用它自带的默认登录页（很丑）。

# `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

`[...nextauth]` 是动态路由，捕获所有 `/api/auth/` 下的请求，比如：

- `/api/auth/signin` — 发起登录
- `/api/auth/callback/google` — Google 登录完回调
- `/api/auth/signout` — 登出
- `/api/auth/session` — 获取 session

NextAuth 内部处理所有这些路径，你不需要手写任何逻辑。

# `middleware.ts`

```ts
export default auth((req) => {
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(loginUrl);
  }
});
```

中间件运行在 Edge 层，比页面组件更早执行，在请求到达页面之前就能拦截。

我把 `/onboarding` 和 `/dashboard` 设为受保护路由。用户没登录访问这些路径，直接被重定向到 `/login`，不会渲染任何页面内容。

`matcher` 配置排除了 `api/auth` 路径——这很关键，如果中间件拦截了自己的 auth 路由，登录请求会陷入死循环。

# `providers.tsx` + `layout.tsx`

NextAuth v5 在 Server Component 里可以直接调`auth()` 获取 session，不需要任何 Provider。但 Client Component 里的 `useSession()` hook 需要一个 React Context 来读取数据，那个 Context 就是 `SessionProvider`。

因为 `SessionProvider` 内部用了 `useState` 等 React hooks，它必须是 Client Component（`"use client"`）。但 `layout.tsx` 是 Server Component，不能直接用 `"use client"`。

所以拆成两个文件：

- `providers.tsx` — `"use client"` 的薄壳，只包一个 `SessionProvider`
- `layout.tsx` — 保持 Server Component，只引入这个壳
  这是 Next.js App Router 里处理"Server Component 需要包 Client Component"的标准模式。

# `login/page.tsx`

登录页用了 Server Action 来触发登录：

```jsx
<form action={async () => {
  "use server";
  await signIn("google", { redirectTo: "/onboarding" });
}}>
```

这里没有用 `onClick` 或 `fetch`，而是 Server Action。原因：`signIn()` 函数来自 `@/auth`，只能在服务端运行。Server Action 让你在表单提交时直接在服务端执行函数，不需要手写 API 路由。

登录成功后重定向到 `/onboarding`（你可以之后改成 `/dashboard`）。

未来加新的登录方式，只需在 `{/* Future providers go here */}` 下面复制一个 `<form>` 改 provider 名就行。
