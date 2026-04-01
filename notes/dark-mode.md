# Dark Mode 实现原理

整个系统由三层组成:

## 1. Tailwind 配置 (globals.css)

```css
@custom-variant dark (&:where(.dark, .dark *));
```

这行告诉 Tailwind v4：所有 dark: utility（如 `dark:bg-gray-800`）只在 `.dark` class
存在于祖先元素时才生效。这是class-based dark mode，区别于默认的 prefers-color-scheme
媒体查询方式。

切换点就是 `<html>` 元素上有没有 `.dark`。

## 2. ThemeToggle 组件 (ThemeToggle.tsx)

```js
// 挂载时读取用户上次的选择
useEffect(() => {
  const saved = localStorage.getItem("theme");
  const isDark = saved === "dark";
  setDark(isDark);

  document.documentElement.classList.toggle("dark", isDark);
}, []);

// 点击时切换
const toggle = () => {
  const next = !dark;
  setDark(next);

  document.documentElement.classList.toggle("dark", next); // 操作 <html>
  localStorage.setItem("theme", next ? "dark" : "light"); // 持久化
};
```

关键操作是
`document.documentElement.classList.toggle("dark",
   next)`——直接在 `<html>` 上加/移除 `.dark`
class，Tailwind 的 dark: variants 立即全部生效。

## 3. 组件层：dark: variants

所有组件都手动加了对应的暗色类，例如：

```jsx
  // MealCard.tsx
  <div className="border border-gray-200
  dark:border-gray-700 dark:bg-gray-800 ...">

  // NutritionCard.tsx — colorClass 含 dark 变体
  colorClass="bg-teal-50 text-teal-700
  dark:bg-teal-900/30 dark:text-teal-300"
```

## 数据流

```
  用户点击 Toggle
    → setDark(true)
    → document.documentElement.classList.add("dark")
    → CSS selector (.dark *) 匹配所有后代元素
    → 所有 dark: 类生效，页面即时变色
    → localStorage.setItem("theme", "dark")

  下次打开页面
    → useEffect 读取 localStorage
    → 恢复上次状态
```

## 为什么不用 prefers-color-scheme？

媒体查询是跟随系统的，用户无法手动切换。class-based 方案让用户自己控制，且可以持久化偏好——这是主流
网站（GitHub、Tailwind 官网等）的做法。
