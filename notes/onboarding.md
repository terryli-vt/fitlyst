# Onboarding — localStorage Progress Persistence

## Problem / 问题

The onboarding questionnaire has 7 steps. All state lived only in React (`useState`), so refreshing the page at any step would wipe everything the user had already filled in.

Onboarding 问卷共有 7 个步骤。所有状态仅保存在 React 的 `useState` 中，因此用户在填写过程中刷新页面，已填内容会全部丢失。

---

## Solution / 解决方案

The fix lives entirely in `src/features/onboarding/hooks/useOnboarding.ts`.

修改集中在 `src/features/onboarding/hooks/useOnboarding.ts` 这一个文件里。

### 1. Define what to persist / 定义需要持久化的数据

```ts
interface PersistedState {
  profile: UserProfile;   // all form answers
  currentStep: number;    // which step the user is on
  heightUnit: "cm" | "ft";
  weightUnit: "kg" | "lb";
}
```

These four values are everything needed to fully restore the form to the exact state the user left it.

这四个值足以完整还原用户离开时的表单状态。

### 2. Three localStorage helpers / 三个 localStorage 工具函数

```ts
const STORAGE_KEY = "fitlyst_onboarding";

function loadFromStorage(): Partial<PersistedState>   // read + parse JSON
function saveToStorage(state: PersistedState): void   // JSON.stringify + write
function clearStorage(): void                          // remove the key
```

All three are wrapped in `try/catch` so a browser with localStorage disabled (private mode, quota exceeded, etc.) never breaks the page.

三个函数都用 `try/catch` 包裹，防止浏览器禁用 localStorage（隐私模式、存储满等）时页面崩溃。

### 3. Initialize state from storage / 从 localStorage 初始化状态

```ts
const saved = loadFromStorage();

const [currentStep, setCurrentStep] = useState(saved.currentStep ?? 0);
const [profile, setProfile]         = useState(saved.profile ?? defaultProfile);
const [heightUnit, setHeightUnit]   = useState(saved.heightUnit ?? "cm");
const [weightUnit, setWeightUnit]   = useState(saved.weightUnit ?? "kg");
```

`??` (nullish coalescing) means: use the saved value if it exists, otherwise fall back to the default. This runs once on mount — if there is nothing saved yet, the form starts blank as before.

`??`（空值合并运算符）的含义是：如果存储中有值就用存储的值，否则退回默认值。这段代码只在组件挂载时执行一次——若没有存储数据，表单照常从空白开始。

### 4. Sync changes to storage / 将状态变化同步到 localStorage

```ts
useEffect(() => {
  saveToStorage({ profile, currentStep, heightUnit, weightUnit });
}, [profile, currentStep, heightUnit, weightUnit]);
```

`useEffect` runs after every render where one of the listed dependencies changed. Any time the user picks an answer or moves to the next step, the latest state is written to localStorage automatically.

`useEffect` 在依赖项发生变化的每次渲染后执行。用户每次选择答案或切换步骤，最新状态都会自动写入 localStorage。

### 5. Clear storage on completion / 完成后清除存储

```ts
clearStorage();
setShowResults(true);
```

Once the profile is saved to the database successfully, the localStorage entry is deleted. This ensures that if the same user (or another user on the same browser) comes back to `/onboarding`, they start with a blank form rather than seeing someone else's answers.

一旦 profile 成功保存到数据库，localStorage 中的记录随即删除。这样同一用户（或同一浏览器的其他用户）下次访问 `/onboarding` 时，表单会从空白重新开始，而不会看到之前的答案。

---

## Data flow summary / 数据流总结

```
Page load  →  loadFromStorage()  →  useState(saved ?? default)
User input →  setProfile / setCurrentStep  →  useEffect → saveToStorage()
Submit OK  →  clearStorage()  →  setShowResults(true)
```

---

## Why not a custom hook or context? / 为什么不用自定义 hook 或 Context？

The onboarding flow is a single-page concern; there is no need to share this state across routes. Keeping the persistence logic inside `useOnboarding` alongside the rest of the form state keeps everything in one place and avoids unnecessary complexity.

Onboarding 是单页面内部的功能，不需要跨路由共享状态。将持久化逻辑放在 `useOnboarding` 内部，与其余表单状态放在一起，既集中又避免了不必要的复杂度。

---

# Onboarding — Server-Side Auth & Profile Check

## Problem / 问题

The original `/onboarding` page was a client component. On load it had to:
1. Wait for `useSession` to resolve (NextAuth client session)
2. Fetch `/api/profile` to check if the user already had a profile
3. Only then decide whether to redirect or show the form

This caused a visible loading spinner ("flash") before the form appeared, and required two network round-trips before any useful content was shown.

原来的 `/onboarding` 是客户端组件，页面加载后需要：
1. 等待 `useSession` 解析 NextAuth session
2. 再 fetch `/api/profile` 检查用户是否已有档案
3. 最后才决定跳转还是显示表单

这导致用户会看到短暂的加载 spinner（闪烁），且需要两次网络往返才能显示有效内容。

---

## Solution / 解决方案

Split the page into two files:

将页面拆分为两个文件：

### `src/app/onboarding/page.tsx` — Server Component (async)

```ts
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (profile) {
    redirect("/profile");
  }

  return <OnboardingClient />;
}
```

The auth check and database query run inside the server before any HTML is sent to the browser. If either condition triggers a redirect, the browser receives an HTTP 307 response and never loads the onboarding page at all.

auth 检查和数据库查询在服务器内部完成，浏览器尚未收到任何 HTML。如果触发跳转，浏览器收到的是 HTTP 307 响应，onboarding 页面根本不会被加载。

### `src/app/onboarding/OnboardingClient.tsx` — Client Component

Contains all the interactive form logic (previously in `page.tsx`), with the following removed:
- `useSession` import and usage
- `authChecked` state
- The `useEffect` that fetched `/api/profile`
- The loading spinner that guarded render until auth was confirmed

包含所有交互表单逻辑（原 `page.tsx` 的内容），并移除了：
- `useSession` 的引入和使用
- `authChecked` 状态
- 负责 fetch `/api/profile` 的 `useEffect`
- 等待 auth 确认前显示的加载 spinner

---

## server `redirect()` vs client `router.push()` / 服务端与客户端跳转的区别

| | `redirect()` (server) | `router.push()` (client) |
|---|---|---|
| 触发时机 | 服务端渲染阶段，返回 HTML 之前 | 客户端 JS 执行后 |
| HTTP 状态码 | 307 / 308 | 无（纯前端 SPA 导航） |
| 用户可见内容 | 浏览器从未渲染目标页以外的内容 | 当前页可能短暂显示后再跳转 |
| 浏览器历史记录 | 默认不留记录（307） | 留下记录（可前进/后退） |
| 适用场景 | 权限检查、保护路由 | 用户主动操作后的页面跳转 |

`redirect()` is the right choice when the user should never reach the page at all. `router.push()` is appropriate for user-initiated navigation (e.g., clicking "Done" to return to the home page).

`redirect()` 适合用于用户根本不应到达该页面的场景。`router.push()` 适合用户主动操作后的跳转（例如点击"Done"返回首页）。

---

## Data flow before and after / 改动前后的数据流

**Before (client-side check):**
```
浏览器请求 /onboarding
  → 服务器返回 HTML + JS          (网络往返 1)
  → 浏览器渲染页面（用户看到 spinner）
  → JS fetch /api/profile          (网络往返 2)
  → 服务器查数据库
  → 浏览器收到响应，决定跳转或显示表单
```

**After (server-side check):**
```
浏览器请求 /onboarding
  → 服务器查 session + 数据库
  → 服务器返回 307 redirect 或完整页面 HTML  (网络往返 1)
  → 浏览器直接跳转或渲染表单（无 spinner）
```

Two round-trips collapsed into one. The database query happens inside the server's own process — invisible to the browser.

两次网络往返合并为一次。数据库查询发生在服务器内部进程中，浏览器完全感知不到。
