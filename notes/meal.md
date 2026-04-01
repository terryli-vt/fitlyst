# Meal Daily Count 机制

```
请求进来
    → 查用户的 mealIdeas 记录
    → 比较 lastGeneratedDate 是否是今天
    → 如果 count >= 10 → 返回 429
    → 否则调用 OpenAI
    → upsert：更新 mealsJson + dailyCount +1 + lastGeneratedDate = 今天
```

用了 onConflictDoUpdate，即 INSERT OR
UPDATE，第一次生成插入新行，之后每次都更新同一行。

"我用了一个 date-stamp 计数法
而不是定时重置。数据库里每个用户存两个字段：当天计数
和最后生成日期。每次请求时，把 `lastGeneratedDate` 和今
天的日期字符串比较——如果不一致，说明是新的一天，count
直接视为 0，不需要任何 cron job
或后台任务来清理数据。这是一种 lazy reset
的思路，简单且无状态。"

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
