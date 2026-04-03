# 用户流程

```
访问网站
    │
    ▼
是否已登录？
    ├── 否 → 显示登录/注册页
    │           │
    │           ▼
    │         登录成功
    │
    └── 是
          │
          ▼
    是否填过问卷？
          │
          ├── 否 → Onboarding 流程（现有的7步问卷）
          │              │
          │              ▼
          │         完成后保存到数据库
          │              │
          │              ▼
          │         跳转到 Profile 页
          │
          └── 是 → 直接到 Profile 页
```

# Profile Page

```
Profile 页
    │
    ├── 显示用户基本信息（身高/体重/年龄等）
    │       └── [编辑] 按钮 → 修改一项或多项
    │                              │
    │                              ▼
    │                        保存 → 自动重新计算热量推荐
    │                               → 更新页面显示
    │
    ├── 显示热量推荐（calories / protein / carbs / fat）
    │       └── 随用户信息更新自动刷新
    │
    └── Meal Ideas 区域
            ├── 如果从未 generate 过 → 显示 [Generate Meal Ideas] 按钮
            ├── 如果已有记录 → 直接展示上次生成的结果
            └── [Regenerate] 按钮 → 重新调用 AI 生成并覆盖保存
```

# 开发顺序

- 装依赖 + 配置 ORM + 建数据库表
- 接入 NextAuth（邮箱登录先，OAuth 后加）
- 写 /api/profile 的读写逻辑
- Onboarding 完成后调 API 保存数据
- 做 Profile 页面（展示 + 编辑）
- 把 meal ideas 的生成结果也存到数据库

# UserProfileCard 编辑功能实现

## 1. 编辑功能

用 `isEditing` boolean state 控制显示模式和编辑模式的切换。

**进入编辑：**
```
点击 Edit 按钮 → handleEdit()
  → 把当前 profile 的值重新填入 editForm（重置草稿）
  → setIsEditing(true)
```

`editForm` 是独立的 state，存着用户正在修改的临时数据，和已保存的 `profile` prop 互相独立，编辑中不会影响页面其他地方展示的数据。

## 2. 保存 & 重新计算 Nutrition

**点击 Save Changes → `handleSave()`：**

```
1. 前端校验：所有字段不能为空
2. PATCH /api/profile  ← 把 editForm 数据发给后端
3. 后端返回 { nutrition: DBNutrition }  ← 后端负责重新计算
4. 调用 onSaved(newProfile, data.nutrition)  ← 通知父组件更新
5. setIsEditing(false)
```

Nutrition 的重新计算发生在后端，前端只是把新的 profile 数据传过去，后端返回算好的结果。父组件通过 `onSaved` 回调拿到新的 profile 和 nutrition，再去更新页面上的 NutritionCard 等其他部分。

## 3. Cancel 撤销更改

```
点击 Cancel → handleCancel()
  → setSaveError(null)
  → setIsEditing(false)
```

Cancel 很简单——编辑过程中所有修改都只存在 `editForm` 局部 state 里，直接 `setIsEditing(false)` 切回展示模式，`editForm` 的脏数据自然被丢弃。下次再点 Edit，`handleEdit()` 会重新从 `profile` prop 初始化 `editForm`，不会残留上次未保存的内容。

---

## 4. Unsaved Changes Warning / 离开前的未保存提示

### Problem / 问题

用户在编辑表单时，如果误点了 Cancel、刷新了页面、或关闭了标签页，已填写的改动会静默丢失，没有任何提示。

When editing the profile form, changes could be silently lost if the user accidentally clicked Cancel, refreshed the page, or closed the tab.

### Solution / 解决方案

引入 `isDirty` boolean state，追踪表单是否有未保存的改动，并在两个场景下介入：

Introduced an `isDirty` boolean state to track whether the form has unsaved changes, and intercept two scenarios.

---

#### `isDirty` 的生命周期 / Lifecycle of `isDirty`

| 时机 | 操作 |
|---|---|
| 点击 Edit 进入编辑模式 | `setIsDirty(false)` — 重置，表单刚加载还没改动 |
| 用户修改任意字段 | `setIsDirty(true)` — 标记为"有脏数据" |
| 成功保存（Save Changes） | `setIsDirty(false)` — 已持久化，不再算脏 |
| 取消编辑（Cancel） | `setIsDirty(false)` — 丢弃草稿，重置标记 |

---

#### 场景一：点击 Cancel 时 / Scenario 1: Clicking Cancel

```ts
const handleCancel = () => {
  if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
  setSaveError(null);
  setIsDirty(false);
  setIsEditing(false);
};
```

- 如果 `isDirty` 是 `false`（用户没改任何东西），直接关闭，无弹窗。
- 如果 `isDirty` 是 `true`，弹出浏览器原生 `confirm` 对话框。用户点"取消"就留在表单，点"确定"才丢弃改动。

If `isDirty` is `false`, Cancel closes immediately with no dialog. If `true`, a native `confirm` dialog appears — "Cancel" keeps the form open, "OK" discards changes.

---

#### 场景二：浏览器级导航 / Scenario 2: Browser-level navigation

```ts
useEffect(() => {
  if (!isEditing || !isDirty) return;
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [isEditing, isDirty]);
```

`beforeunload` 事件会在以下情况触发：刷新页面、关闭标签页、在地址栏输入新地址、浏览器前进/后退。调用 `e.preventDefault()` 后，浏览器会显示自己内置的"离开页面？"确认弹窗（各浏览器样式不同，文案无法自定义）。

The `beforeunload` event fires on: page refresh, tab close, address bar navigation, browser back/forward. Calling `e.preventDefault()` triggers the browser's built-in "Leave page?" dialog (browser-specific UI, text not customizable).

`useEffect` 的依赖是 `[isEditing, isDirty]`，只有两者同时为 `true` 时才注册监听器。返回的清理函数确保退出编辑模式后监听器被移除，不会有副作用残留。

The effect only registers the listener when both `isEditing` and `isDirty` are `true`. The cleanup function removes it when either goes `false`, leaving no side effects.

---

#### `updateForm` 辅助函数 / The `updateForm` helper

```ts
const updateForm = (updater: Parameters<typeof setEditForm>[0]) => {
  setIsDirty(true);
  setEditForm(updater);
};
```

所有表单字段的 `onChange` 都改用 `updateForm` 代替直接调用 `setEditForm`。这样任何字段的修改都会自动触发 `isDirty = true`，不需要在每个 onChange 里单独写。

All `onChange` handlers call `updateForm` instead of `setEditForm` directly. This centralizes the dirty-marking logic — any field change automatically sets `isDirty = true` without repeating the call everywhere.

---

#### 局限性 / Limitations

`beforeunload` 只拦截浏览器原生导航，**不拦截 Next.js 的客户端路由跳转**（如点击页面内的 `<Link>` 组件）。目前 Profile 页在编辑状态下没有显眼的站内跳转链接，所以这一场景风险较低，暂未处理。

`beforeunload` only intercepts browser-native navigation — it does **not** intercept Next.js client-side route changes (e.g. clicking a `<Link>`). Since the Profile page has no prominent in-app navigation links visible during editing, this edge case is low-risk and left unhandled for now.

---

## 5. Profile Page Loading Skeleton / 骨架屏

### Problem / 问题

Profile 页面是 Next.js Server Component，需要向数据库发起三条并行查询（profile、nutrition、mealIdeas）。查询完成前页面一片空白，体验差。

The Profile page is a Next.js Server Component that runs three parallel DB queries before rendering. Until they complete, the browser shows nothing.

### Solution / 解决方案

新建 `src/app/profile/loading.tsx`。这是 Next.js App Router 的约定文件——框架会自动把同目录的 `page.tsx` 包进 `<Suspense>`，数据加载期间显示 `loading.tsx` 的内容，**不需要修改任何现有代码**。

Created `src/app/profile/loading.tsx`. This is a Next.js App Router convention file — the framework automatically wraps `page.tsx` in a `<Suspense>` boundary, showing `loading.tsx` while data is being fetched, **with zero changes to existing code**.

### How it works / 工作原理

```
用户访问 /profile
    │
    ▼
Next.js 立即返回 loading.tsx（骨架屏）给浏览器  ← 用户马上看到内容
    │
    │  同时在服务器执行 page.tsx：
    │    → auth() 验证 session
    │    → Promise.all([profile, nutrition, mealIdeas])  ← 三条 DB 查询并行
    │
    ▼
查询完成 → 用真实内容替换骨架屏
```

### 骨架屏的设计原则 / Skeleton design

骨架屏的结构和尺寸严格对应真实页面的每一块区域，目的是让替换瞬间尽量不产生布局跳动：

The skeleton mirrors the exact layout and proportions of each section, minimizing layout shift when real content replaces it:

| 骨架区域 | 对应真实组件 |
|---|---|
| 圆形 + 两行文字 + 按钮 | `ProfileHeader`（头像、姓名、邮箱、登出） |
| 6 个格子 | `UserProfileCard`（身高/体重/年龄等字段） |
| 4 个 macro 格子 + 2 个底部格子 | `NutritionCard`（calories/protein/carbs/fat + BMI/BMR） |
| 3 张卡片 | `MealRecommendations`（meal idea 卡片占位） |

所有占位块使用 `animate-pulse` 实现呼吸动画，深色模式下用 `dark:bg-gray-700` 适配。

All placeholder blocks use `animate-pulse` for the breathing animation, with `dark:bg-gray-700` for dark mode support.
