# 为什么叫 Hook（钩子）

字面意思：hook = 钩子，把东西"钩"进来。

在 React 里，函数组件本身是个"纯函数"——进来 props，出去 JSX，跑完就销毁，天生没有记忆，也感知不到 React 内部的运作。

Hook 就是让你从函数组件内部钩入 React 的能力：

```typescript
// 没有 useState，组件跑完变量就消失了
function Counter() {
    let count = 0 // 每次渲染都重置为 0，毫无意义
    return <div>{count}</div>
}
```

```typescript
// 用 useState "钩入" React 的状态系统
function Counter() {
    const [count, setCount] = useState(0) // React 帮你记住这个值
    return <div>{count}</div>
}
```

`useState` 钩入了 React 的状态存储，`useEffect` 钩入了生命周期，`useContext` 钩入了上下文系统。

# 自定义 Hook 是什么

就是把多个内置 Hook 打包成一个函数，方便复用。

`useMealIdeas.ts` 本质上只是：

```ts
function useMealIdeas() {
  const [isLoading, setIsLoading] = useState(false)   // 钩入状态
  const [mealIdeas, setMealIdeas] = useState(null)    // 钩入状态
  const [error, setError]         = useState(null)    // 钩入状态

  const generateMealIdeas = async () => { ... }       // 操作这些状态的函数

  return { isLoading, mealIdeas, error, generateMealIdeas }
}
```

如果不抽成 Hook，这 3 个 `useState` 和 `generateMealIdeas` 就得全写在 `OnboardingPage` 组件里，和其他十几个状态混在一起，很难维护。

## 命名规范：为什么必须叫 use 开头

这是 React 的强制规定，不是风格偏好。

React 靠 `use` 前缀来识别这是一个 Hook，从而在开发模式下对它做检查（比如不能在 `if` 里调用 Hook）。叫 `mealIdeas.ts` 导出同样的函数，功能一样，但 React 的规则检查就失效了
