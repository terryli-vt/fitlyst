# API 路由输入校验

## 现在的问题

`/api/profile` 的 POST 和 PATCH 两个方法校验逻辑几乎完全一样，都手写了一遍：

```ts
if (!VALID_GENDERS.includes(gender)) return ...
if (!VALID_ACTIVITY_LEVELS.includes(activityLevel)) return ...
if (isNaN(hCm) || hCm <= 0 || hCm > 300) return ...
// ...
```

三个问题：
1. **重复代码** — 同样的逻辑在 POST 和 PATCH 里各写了一遍，改一处要改两处
2. **不一致** — 各路由校验严格程度不同，`/api/generate-meal-ideas` 只校验了 `calories` 和 `protein`，`carbs` 和 `fat` 漏掉了
3. **没有类型推导** — 手写 `if` 判断，通过校验后 TypeScript 仍不知道变量的具体类型

---

## 解决方案：Zod

[Zod](https://zod.dev) 是 TypeScript 生态里最常用的 schema 校验库，定义一次，到处复用，校验通过后自动推导类型。

### 安装

```bash
npm install zod
```

### 用法示例

```ts
// src/lib/schemas.ts
import { z } from 'zod'
import { GENDER_OPTIONS, ACTIVITY_LEVELS, GOAL_OPTIONS, GOAL_PRIORITY_OPTIONS } from '@/features/onboarding/config'

export const profileSchema = z.object({
  gender: z.enum(GENDER_OPTIONS.map(o => o.value) as [string, ...string[]]),
  activityLevel: z.enum(ACTIVITY_LEVELS.map(o => o.value) as [string, ...string[]]),
  goal: z.enum(GOAL_OPTIONS.map(o => o.value) as [string, ...string[]]),
  goalPriority: z.enum(GOAL_PRIORITY_OPTIONS.map(o => o.value) as [string, ...string[]]),
  heightCm: z.number().positive().max(300),
  weightKg: z.number().positive().max(500),
  age: z.number().int().positive().max(120),
})

export const nutritionSchema = z.object({
  calories: z.number().positive(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
})
```

在路由里使用：

```ts
// POST 和 PATCH 都用同一个 schema
const result = profileSchema.safeParse(body)
if (!result.success) {
  return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
}

// 通过校验后，result.data 自动带有正确的 TypeScript 类型
const { heightCm, weightKg, age, gender } = result.data
```

### 对比

| | 现在（手写 if） | Zod |
|---|---|---|
| 重复代码 | POST 和 PATCH 各写一遍 | 定义一次，共用 |
| 漏字段 | 容易漏 | schema 强制覆盖所有字段 |
| 类型推导 | 无 | 校验通过后自动推导 |
| 错误信息 | 手写字符串 | 自动生成结构化错误 |
