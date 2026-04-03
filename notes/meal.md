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
