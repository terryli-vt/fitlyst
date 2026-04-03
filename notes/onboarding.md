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
