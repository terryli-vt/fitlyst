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
