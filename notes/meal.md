# Meal Daily Count 机制

```
请求进来
    → 查用户的 mealIdeas 记录（取 generatedAt + dailyCount）
    → 用 UTC 日期比较 generatedAt 是否是今天
        → 同一天：使用 dailyCount
        → 不同天：视为 0（lazy reset，无需 cron job）
    → 如果 count >= 10 → 返回 429
    → 否则调用 OpenAI
    → upsert：更新 mealsJson + dailyCount +1 + generatedAt = now
```

用了 onConflictDoUpdate，即 INSERT OR UPDATE，第一次生成插入新行，之后每次都更新同一行。

日期比较用 `getUTCFullYear/Month/Date` 三个字段同时匹配，全部基于服务端时间，不依赖任何客户端传入的数据：

```ts
// mealGenerationLimit.ts
const sameUTCDay =
  now.getUTCFullYear() === generated.getUTCFullYear() &&
  now.getUTCMonth()    === generated.getUTCMonth()    &&
  now.getUTCDate()     === generated.getUTCDate();

return sameUTCDay ? (record.dailyCount ?? 0) : 0;
```

之前用 `lastGeneratedDate`（字符串 `"YYYY-MM-DD"`）做比较，是冗余字段。现在直接复用 `generatedAt` timestamp，去掉了这个多余的列（列仍在 schema 中保留为 nullable，但不再读写）。

"依然是 lazy reset 的思路——不需要任何定时任务清理数据。每次请求时实时判断 generatedAt 是否在今天，不在就把 count 当 0 处理。区别是现在用的是真正的 UTC timestamp 比较，而不是字符串拼接，更严谨也更不容易出错。"

# Dietary Preferences — 一句话总结 / Elevator Pitch

**English:**
> "I added three nullable text columns to the `user_profiles` table to store dietary restrictions, allergies, and cuisine preferences as JSON arrays. On the frontend, I built a tag-based modal that appears before meal generation — the user's saved preferences are pre-filled each time so they can adjust before generating. When the user confirms, the app PATCHes the profile to persist the selections, then passes them to the meal generation API. On the backend, the preferences are injected into the OpenAI prompt with explicit instructions to respect dietary restrictions and prefer the selected cuisines."

**中文：**
> "我在 `user_profiles` 表中新增了三个 nullable text 列，用 JSON 数组格式存储饮食限制、过敏信息和菜系偏好。前端做了一个 tag 选择的 modal，在用户点击生成餐食前弹出，并预填上次保存的偏好方便修改。用户确认后，app 先 PATCH profile 接口持久化选择，再把偏好传给餐食生成 API。后端将偏好注入 OpenAI prompt，并明确要求 AI 遵守饮食限制、优先匹配菜系偏好。"

**如果面试官追问设计决策：**
- **为什么用预设选项而不是自由输入** → 防止用户输入无效或 adversarial 的内容影响 AI 回复
- **为什么存在 user_profiles 而不是单独的表** → 偏好和 profile 是一对一关系，没必要多一张表增加 join
- **为什么 PATCH 支持两种形态** → 偏好和身高体重是独立编辑的，不应该要求每次更新偏好都带上完整的 profile 数据

---

# Dietary Preferences — 实现逻辑

## 整体设计

用户在生成餐食建议之前可以选择饮食偏好，偏好分三类：

| 类别 | 字段 | 示例选项 |
|---|---|---|
| 饮食限制 | `dietaryRestrictions` | Vegetarian, Vegan, Halal… |
| 过敏 | `allergies` | Nuts, Dairy, Shellfish… |
| 菜系偏好 | `cuisinePreferences` | Asian, Mediterranean, Italian… |

所有选项为预设 checkbox/tag，不允许自由输入，防止无效内容影响 AI 回复。

---

## 数据存储

三个字段作为 nullable text 列加在 `user_profiles` 表中，值为 JSON 序列化的字符串数组：

```ts
// schema.ts
dietaryRestrictions: text("dietary_restrictions"), // e.g. '["vegetarian","gluten-free"]'
allergies: text("allergies"),
cuisinePreferences: text("cuisine_preferences"),
```

读取时用 `parseJsonArray()` 解析，空值返回 `[]`，不抛出错误：

```ts
function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
```

---

## 每次生成前弹出 Modal

用户点击 Generate / Regenerate 时，不直接调用 API，而是先弹出 `DietaryPreferencesModal`。

Modal 特点：
- 预填用户上次保存的偏好（无论 Generate 还是 Regenerate 都会弹，方便修改）
- **Generate** 按钮 → 将当前选择 PATCH 到 DB，然后携带偏好调用生成 API
- **Generate without preferences** 按钮 → 直接生成，不保存、不传偏好

这样用户每次都能看到并修改自己的偏好，同时不强制必须选。

---

## API 层

### PATCH /api/profile — 保存偏好

`patchProfileSchema` 支持两种请求体：
1. 完整 profile 更新（身高/体重/目标等，带可选偏好）
2. 仅偏好更新（只传三个偏好字段）

区分逻辑：

```ts
if (!("heightCm" in data)) {
  // 仅更新偏好字段
  await db.update(userProfiles).set({ dietaryRestrictions: ..., ... }).where(...)
  return { success: true }
}
// 否则执行完整 profile 更新
```

Zod 用 `z.union([fullSchema, prefsOnlySchema])` 验证两种形态。

### POST /api/generate-meal-ideas — 偏好注入 Prompt

请求体接受可选的 `preferences` 字段，`constructPrompt()` 将其插入 prompt：

```ts
function constructPrompt(nutrition, preferences?) {
  // 如果有偏好，追加到 prompt：
  // "User Preferences (strictly follow these):
  //  - Dietary restrictions: vegetarian
  //  - Allergies (must avoid): nuts
  //  - Preferred cuisines: asian"
  // 并在 Requirements 末尾追加：
  // "8. Strictly respect all dietary restrictions and allergies"
}
```

没有偏好时 prompt 与之前完全一致，不影响原有行为。

---

## 前端数据流

```
用户点击 Generate
  → useMealIdeas.generateMealIdeas(nutrition)
      → 记录 pendingNutrition，打开 modal

用户在 modal 选择后点 Generate
  → handleModalConfirm(preferences)
      → PATCH /api/profile（保存偏好）
      → doGenerate(pendingNutrition, preferences)
          → POST /api/generate-meal-ideas { nutrition, preferences }

用户点击 "Generate without preferences"
  → handleModalSkip()
      → doGenerate(pendingNutrition, emptyPreferences)
          → POST /api/generate-meal-ideas { nutrition, preferences: { [], [], [] } }
```

---

## Profile 页的独立编辑入口

Profile 页新增 `DietaryPreferencesCard` 组件，位于 UserProfileCard 和 MealRecommendations 之间。

- 显示模式：以 tag 形式展示已保存的偏好，无偏好时显示提示文字
- 编辑模式：tag 点选，独立的 **Save Preferences** 按钮，只调用偏好-only PATCH，不影响身高/体重等字段
- `ProfileContent` 维护 `preferences` state，`DietaryPreferencesCard` 和 `MealRecommendations` 共享同一份数据

---

## 涉及的文件

| 文件 | 改动 |
|---|---|
| `src/db/schema.ts` | 新增 3 个 nullable text 列 |
| `src/features/onboarding/config.ts` | 新增三组选项常量 + valid value 数组 |
| `src/features/onboarding/types.ts` | 新增 `DietaryPreferences` 类型 |
| `src/features/profile/types.ts` | `DBProfile` 加入三个偏好字段 |
| `src/lib/schemas.ts` | `patchProfileSchema` 改为 union，`generateMealIdeasSchema` 加 preferences |
| `src/app/api/profile/route.ts` | PATCH 处理偏好-only 更新 |
| `src/app/api/generate-meal-ideas/route.ts` | `constructPrompt` 接受并注入 preferences |
| `src/components/DietaryPreferencesModal.tsx` | 新建：生成前弹出的 modal |
| `src/features/onboarding/hooks/useMealIdeas.ts` | 拆分生成流程，加入 modal 状态管理 |
| `src/app/onboarding/OnboardingClient.tsx` | 接入 modal |
| `src/features/profile/components/MealRecommendations.tsx` | 接入 modal |
| `src/features/profile/components/DietaryPreferencesCard.tsx` | 新建：profile 页偏好编辑卡片 |
| `src/features/profile/components/ProfileContent.tsx` | 加入 DietaryPreferencesCard，传递 preferences |
| `src/app/profile/page.tsx` | 从 DB 读取偏好并传入 ProfileContent |

# Cooking Instruction 展开逻辑

核心：每个 MealCard 有自己独立的 state

```tsx
// MealCard.tsx:8
const [isExpanded, setIsExpanded] = useState(false);
```

每张卡片是独立的组件实例，各自维护自己的 isExpanded状态。点击按钮时：

```tsx
onClick={() => setIsExpanded((prev) => !prev)}
```

就是一个简单的 toggle，prev 取当前值取反。函数式更新保证拿到的是最新state，避免闭包陈旧值问题

```tsx
// MealRecommendations.tsx:95-98：
{
  meals.map((meal, index) => <MealCard key={index} meal={meal} />);
}
```

每次 map 都渲染出一个新的 MealCard 组件实例，React给每个实例分配独立的内存空间存放 state。卡片 A 的 isExpanded 和卡片 B 的 isExpanded是完全不同的两个变量，互不干扰。

"展开逻辑用的是 组件级局部 state。isExpanded 定义在MealCard 内部，而不是父组件里，所以每个卡片实例各自管理自己的展开状态，天然支持多个同时展开，不需要任何额外协调逻辑。如果我想改成'同时只能展开一个'，就需要把state 提升到父组件，用一个 expandedIndex 来统一控制."
