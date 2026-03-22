# 整体数据流

```
用户点击 "Continue with Google"
        ↓
login/page.tsx 调用 signIn("google")
        ↓
NextAuth 重定向到 Google 授权页面
        ↓
用户同意授权，Google 返回授权码 (code)
        ↓
api/auth/[...nextauth]/route.ts 接收回调 (/api/auth/callback/google)
NextAuth 用 code 换取 access_token + id_token
        ↓
NextAuth 从 id_token 提取用户信息
自动写入/更新 users 表 和 accounts 表
生成 JWT，存入浏览器 HttpOnly cookie
        ↓
重定向到 /onboarding
```

# 重点理解

## Code、Access Token、Refresh Token

### Authorization Code（授权码）

- 是什么： 一次性临时凭证，Google 回调时放在 URL 里
- 有效期： 极短，通常几分钟
- 能做什么： 什么都做不了，只能拿去换 token
- 为什么存在： 安全中间层，避免 token 直接暴露在 URL 里

### Access Token（访问令牌）

- 是什么： 真正有权限的凭证
- 有效期： 短，通常 1 小时
- 能做什么： 调用 Google API（如读取 Google 用户信息、Gmail、日历等）
- 类比： 酒店房卡，拿着它能开门，但会过期
- 在你的项目里，NextAuth 拿到 access token 后主要用它获取用户信息，之后存进 `accounts` 表的 `access_token` 字段，但你的应用本身几乎不直接用它。

### Refresh Token（刷新令牌）

- 是什么： 用来续期 access token 的凭证
- 有效期： 长，可能几个月甚至永久
- 能做什么： 当 access token 过期后，用它换一个新的 access token
- 类比： 能重新制作房卡的"主卡"，本身不能开门，但能去前台换新房卡

```
access token 过期
       ↓
用 refresh token 向 Google 请求新的 access token
       ↓
继续使用，用户无感知（不需要重新登录）
```

## OAuth 2.0 授权码流程

**OAuth 授权码流程 = 先拿一张"取货单"(code)，再凭"取货单 + 密钥"去后台换真正的"货"(token)，全程避免敏感信息暴露在前端。**

重要问题: "为什么不直接把 `access_token` 返回给前端？"

- 因为授权码 `code` 通过浏览器跳转传递，但 `code` → `token` 的兑换发生在服务端对服务端（附带 `client_secret`），避免 `token` 暴露在浏览器。

用 `code` 的好处：

- `code` 本身没有权限，偷了也没用
- 真正的 token 交换在服务端对服务端进行，附带只有你知道的 `client_secret`
- 即使 `code` 被截获，没有 `client_secret` 也换不了 token

不让 Google 直接把 `access_token` 放在 URL 里返回, 因为 URL 不安全：

- 会被存在浏览器历史记录里
- 会被服务器日志记录
- 可能被第三方脚本读取

所以要绕这么一圈:

### 第 1 步：用户点击登录按钮

Fitlyst 把用户重定向到 Google，URL 大概长这样：

```
https://accounts.google.com/o/oauth2/auth?
  client_id=你的应用ID
  &redirect_uri=https://fitlyst.com/api/auth/callback/google
  &response_type=code
  &scope=email profile
```

意思是："我是 Fitlyst，我想获取这个用户的 email 和 profile，用完请把结果发回给我"

### 第 2 步：Google 让用户授权

用户看到熟悉的 Google 授权页面：

```
Fitlyst 想要访问：
✓ 你的邮箱地址
✓ 你的基本个人信息

[允许]  [拒绝]
```

### 第 3 步：Google 返回授权码 (code)

用户点允许后，Google 把用户重定向回 Fitlyst：

```
https://fitlyst.com/api/auth/callback/google?code=4/abc123xyz
```

注意：这个 code 只是一个临时凭证，本身没有用户信息，而且几分钟后就过期。

### 第 4 步：Fitlyst 服务端用 code 换 token（关键步骤）

这一步发生在服务器之间(NextAuth 内部自动完成的,不再代码里)，用户浏览器看不到：

```
Fitlyst 服务端 → Google 服务端：
"给你 code + 我的 client_secret，换 access_token"

Google 服务端 → Fitlyst 服务端：
{
  access_token: "ya29.xxxxxx",
  id_token: "eyJhbGc...",   ← 包含用户信息的 JWT
  expires_in: 3600
}
```

### 第 5 步：NextAuth 提取用户信息，写入数据库

NextAuth 解析 `id_token`，拿到用户的 name、email、头像，然后：

- 如果是新用户 → 在 `users` 表创建新记录
- 如果是老用户 → 更新记录
- 生成 JWT（包含用户 ID 等信息），存入浏览器 HttpOnly cookie

## Session

HTTP 是无状态的(stateless, 服务器不记得你的登录信息)，Session 是服务端用来记住用户登录状态的机制。用户登录后服务器生成一个 session 存在数据库，把 session ID 通过 HttpOnly cookie 发给浏览器。之后每次请求浏览器自动带上这个 cookie，服务端查表验证身份。

### 为什么cookie需要是HttpOnly？

- 安全性：HttpOnly cookie 不能被 JavaScript 访问，防止 XSS 攻击窃取 cookie。
- XSS (Cross-site scripting) 攻击：如果 cookie 可被 JavaScript 访问，恶意脚本可能读取内容，冒充用户进行操作。

> 此项目使用 JWT 而非 Session，详见下方。

## JWT（JSON Web Token）

- 一种把信息"打包签名"后传输的格式。长这样`eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
`
- 什么是JWT: JWT 是一种 token 格式，用`.`分三段：Header、Payload、Signature。Header是算法信息, Payload 存用户信息比如 user ID，Signature 是用服务端的密钥对前两段做的签名，用来防止数据被篡改。
- 如何验证: 服务端收到 JWT 后，用header + payload以及自己的`secret_key`重新计算一遍签名，和 JWT 里的签名对比。一致就说明数据没被篡改，再检查一下过期时间，通过就放行。整个过程不需要查数据库。
- Payload 只是 Base64 编码，不是加密，任何人都能解码看到内容，所以 JWT 里不能放敏感数据(密码、银行卡等)，只放 user ID 这类信息。
- 此项目使用 JWT 模式（`session: { strategy: "jwt" }`）。用户登录后 NextAuth 生成一个 JWT 存入浏览器 HttpOnly cookie，每次请求验证签名即可，无需查数据库。Google OAuth 流程中返回的 `id_token` 也是 JWT 格式，NextAuth 用它提取用户信息后生成自己的 JWT。

```
eyJzdWIiOiJ1c2VyMTIzIn0
        ↓ Payload解码
{"sub": "user123", "email": "terry@gmail.com"}
```

## Session vs. Token Based Authentication

- Session Authentication（基于会话的认证）:
  - 有状态(stateful, 服务器记得你的登录信息)，登录信息存在服务端数据库，每次请求查表验证，撤销方便。
  - 撤销登录: 删除数据库里的 session 记录，用户立刻失效。
  - 适合传统 web 应用
  - `登录 → 服务端存 session → 把 session ID 给客户端(cookie)
请求 → 带上 cookie → 服务端查数据库验证`

- Token Based Authentication（JWT模式, 基于令牌的认证）:
  - 无状态(stateless, 服务器不记得你的登录信息)，登录信息存在 token 本身，服务端不存 session，验证只需校验 token 签名和过期时间。
  - 撤销登录: token 在客户端，服务端删不掉。只能等它自然过期，或者维护一个"黑名单"记录哪些 token 已失效，但这又引入了查库操作，失去了 JWT 无状态的优势。
  - 适合移动端, 微服务和 SPA 应用, 性能好但撤销麻烦.
  - **此项目使用此模式**
  - `登录 → 服务端生成 JWT → 把整个 token 给客户端
请求 → 带上 token → 服务端验签名，无需查库
`

# 安装

## 安装依赖

`npm install next-auth@beta @auth/drizzle-adapter`

- `next-auth@beta` — 这是 NextAuth v5（也叫 Auth.js），专门为 Next.js App Router 重写的版本。v4 是给 Pages Router 设计的，用在 App Router 上会有很多摩擦。
- `@auth/drizzle-adapter` — 让 NextAuth 知道怎么用 Drizzle + NeonDB 来存储用户、session 等数据，否则 NextAuth 默认把数据存在内存里，服务重启就全没了。

## 更新 `schema.ts`

这是改动最多的地方，分两部分：

### 给 `users` 表加字段

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

### 新增一张 NextAuth 必须的表

详情见 NextAuth 官方文档：https://authjs.dev/getting-started/adapters/drizzle

- `accounts` 表 — 存 OAuth 账号绑定关系。

一个用户可以绑多个登录方式（比如 Google + GitHub），这张表就是记录"某个用户绑定了哪些第三方账号"。每行是一个绑定关系，有 `provider`（`google`）、`providerAccountId`（Google 那边的用户 ID）、`access_token` 等。这也是为什么加 provider 那么容易——新 provider 的账号自动存进同一张表，用 `provider` 字段区分。

> 此项目使用 JWT 模式，session 存在 cookie 里而非数据库，所以不需要 `sessions` 表。`verificationTokens` 表只给 Magic Link 用，目前也不需要。

## `src/auth.config.ts` — 基础配置

```ts
export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};
```

单独抽出来的原因：`proxy.ts` 运行在 Edge Runtime，不能连接数据库。这个文件不包含任何数据库依赖，可以安全地在 proxy 和 auth.ts 里复用。

## `src/auth.ts` — 核心配置

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db, { ... }),
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

## `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

`[...nextauth]` 是动态路由，捕获所有 `/api/auth/` 下的请求，比如：

- `/api/auth/signin` — 发起登录
- `/api/auth/callback/google` — Google 登录完回调
- `/api/auth/signout` — 登出
- `/api/auth/session` — 获取 session

NextAuth 内部处理所有这些路径(所有认证相关请求)，你不需要手写任何逻辑。

## `src/proxy.ts`

```ts
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(loginUrl);
  }
});
```

Next.js 16 把 `middleware.ts` 改名为 `proxy.ts`，必须放在 `src/` 目录下。

proxy 运行在 Edge 层，比页面组件更早执行，在请求到达页面之前就能拦截。这里使用 `authConfig`（无数据库依赖）而不是 `auth.ts`，因为 Edge Runtime 不能连接数据库，用 JWT 验签即可判断登录状态。

`/onboarding` 和 `/dashboard` 设为受保护路由。用户没登录访问这些路径，直接被重定向到 `/login`。

`matcher` 配置排除了 `api/auth` 路径——这很关键，如果 proxy 拦截了自己的 auth 路由，登录请求会陷入死循环。

## `providers.tsx` + `layout.tsx`

NextAuth v5 在 Server Component 里可以直接调`auth()` 获取 session，不需要任何 Provider。但 Client Component 里的 `useSession()` hook 需要一个 React Context 来读取数据，那个 Context 就是 `SessionProvider`。

因为 `SessionProvider` 内部用了 `useState` 等 React hooks，它必须是 Client Component（`"use client"`）。但 `layout.tsx` 是 Server Component，不能直接用 `"use client"`。

所以拆成两个文件：

- `providers.tsx` — `"use client"` 的薄壳，只包一个 `SessionProvider`
- `layout.tsx` — 保持 Server Component，只引入这个壳
  这是 Next.js App Router 里处理"Server Component 需要包 Client Component"的标准模式。

## `login/page.tsx`

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
