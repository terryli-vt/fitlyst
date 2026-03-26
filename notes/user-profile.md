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
