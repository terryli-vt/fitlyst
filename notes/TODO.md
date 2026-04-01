# Fitlyst — TODO & Improvement Backlog

> Generated: 2026-04-01. Items are grouped by category and ordered by priority within each group.

---

## 🔴 High Priority — Security & Stability

### Security
- [x] Add Content Security Policy (CSP) and other security headers (X-Frame-Options, X-Content-Type-Options, etc.) via `next.config.ts` or middleware
  > 添加内容安全策略和其他安全响应头，防止点击劫持和 MIME 类型嗅探等攻击。
- [x] Sanitize LLM-generated meal content before rendering to prevent XSS
  > AI 生成的餐食内容在渲染前需经过过滤，防止 XSS 跨站脚本攻击。已确认：代码中未使用 `dangerouslySetInnerHTML`，React 默认转义已提供保护。
- [x] Create a `.env.example` file documenting all required environment variables
  > 创建 `.env.example` 文件，列出所有必需的环境变量及示例值，方便团队成员配置。
- [x] Add unified input validation middleware for all API routes instead of ad-hoc per-route validation
  > 用统一的中间件统一校验所有 API 路由的输入，替代各路由分散的手动校验逻辑。
- [x] Review and harden CSRF protection with NextAuth v5
  > 检查并加固 NextAuth v5 的 CSRF 防护配置，确保表单提交不被跨站伪造。

### Stability
- [ ] Add a timeout to all OpenAI API calls (currently can hang indefinitely)
  > 为所有 OpenAI 请求设置超时时间，避免接口挂起导致用户无限等待。
- [ ] Implement retry logic for transient OpenAI failures with user-facing retry button
  > 对 OpenAI 临时性失败实现自动重试，并在页面上提供"重试"按钮供用户手动触发。
- [ ] Replace fragile regex-based JSON extraction from LLM responses with a more robust parser (e.g., structured outputs or JSON mode)
  > 当前用正则从 LLM 响应中提取 JSON，格式稍有变化就会崩溃，改用结构化输出或 JSON mode 更稳健。
- [ ] Fix daily meal generation rate limit — `lastGeneratedDate` relies on client timezone string splitting; switch to server-side UTC timestamp comparison
  > 每日生成次数限制依赖客户端时区，可被绕过；改为服务端 UTC 时间戳比较。
- [ ] Add a custom error page (`not-found.tsx`, `error.tsx`) and global error boundary
  > 添加自定义 404 和错误页面，以及全局错误边界，避免未处理异常直接崩溃白屏。

---

## 🟡 Medium Priority — User Experience

### Data Loss Prevention
- [ ] Persist onboarding form progress to `localStorage` so a page refresh doesn't wipe all 7 steps
  > 将 onboarding 的填写进度保存到 `localStorage`，刷新页面后不会丢失已填内容。
- [ ] Show an "unsaved changes" warning when navigating away from the profile edit form
  > 在 Profile 编辑表单有未保存改动时，离开页面前弹出提示，防止意外丢失修改。

### Interaction Gaps
- [ ] Add a tooltip to the disabled edit button during meal generation explaining why it's locked
  > 生成餐食期间编辑按钮被禁用，应添加 tooltip 说明原因，避免用户困惑。
- [ ] Show a retry button on failed API calls (meal generation, profile save, etc.)
  > API 调用失败时显示"重试"按钮，提升错误恢复体验。
- [ ] Allow users to specify dietary preferences, allergies, or cuisine preferences before generating meal ideas
  > 在生成餐食建议前，让用户填写饮食偏好、过敏信息或菜系偏好，使结果更个性化。
- [ ] Add a loading skeleton to the profile page initial load instead of a blank/spinner state
  > Profile 页面初始加载时显示骨架屏，替代空白或转圈动画，提升视觉体验。
- [ ] Show an explanation for the daily generation limit (currently arbitrary-looking)
  > 每日生成次数上限目前没有说明，应在界面上解释原因（如 API 成本控制）。

### Navigation & Flow
- [ ] Optimize the onboarding auth check — currently does a client-side fetch to `/api/profile`; move to server-side redirect
  > Onboarding 页面目前通过客户端 fetch 检查用户是否已有档案，改为服务端重定向可消除加载闪烁。
- [ ] Add custom 404 and error pages
  > 添加自定义 404 页面和通用错误页面，保持与整体设计风格一致。

---

## 🟡 Medium Priority — Code Quality

### Duplicate Logic
- [ ] Nutrition calculation runs on both client (`useOnboarding`) and server (API route) — remove the client-side duplicate and rely on the server result
  > 营养数据的计算在客户端和服务端各执行了一次，删除客户端的重复计算，统一依赖服务端结果。
- [ ] Meal generation UI is duplicated between `ResultsView` (onboarding) and `MealRecommendations` (profile) — extract to a shared component
  > 餐食生成 UI 在 onboarding 和 Profile 页面各写了一份，提取为共享组件消除重复。
- [ ] Profile form validation logic is repeated in onboarding and profile edit — extract to a shared hook or utility
  > Profile 表单的校验逻辑在 onboarding 和编辑页中重复存在，提取为共享 hook 或工具函数。

### Database
- [ ] Add indexes on frequently queried columns: `users.email`, `userProfiles.userId`, `nutritionResults.userId`, `mealIdeas.userId`
  > 在高频查询字段上添加索引，显著提升数据库查询性能。
- [ ] Add `onDelete: "cascade"` to all foreign key relations so deleting a user cleans up related rows
  > 为所有外键关系添加级联删除，确保删除用户时自动清理其关联数据。
- [ ] `mealIdeas` stores the full meal JSON as a single string column — consider normalizing to a separate `meals` table for querying/filtering
  > `mealIdeas` 表将整个 JSON 存为字符串，考虑拆分为独立的 `meals` 表以支持查询和过滤。
- [ ] Add `updatedAt` timestamps to all tables that are missing them
  > 为所有缺少 `updatedAt` 字段的表补充时间戳，便于追踪数据变更时间。
- [ ] Add database-level constraints for valid ranges on metrics (e.g., height, weight, age)
  > 在数据库层面为身高、体重、年龄等字段添加范围约束，防止异常数据写入。

### Type Safety & Code Organization
- [ ] `UserProfile` type is defined in multiple places — consolidate into a single source of truth
  > `UserProfile` 类型在多处重复定义，统一到单一来源，避免类型不一致。
- [ ] Eliminate `any` types in OpenAI response parsing — use Zod schemas to validate the parsed JSON
  > OpenAI 响应解析中存在 `any` 类型，改用 Zod schema 对解析结果进行类型验证。
- [ ] Extract magic numbers (e.g., max height `300`, max weight `500`, rate limit `10`) into a shared `constants.ts`
  > 将代码中散落的魔法数字（最大身高、最大体重、速率限制等）统一提取到 `constants.ts`。
- [ ] Split large component files: `UserProfileCard.tsx` (289 lines) and `ResultsView.tsx` should be broken into smaller sub-components
  > `UserProfileCard.tsx`（289 行）和 `ResultsView.tsx` 文件过大，拆分为更小的子组件提升可维护性。
- [ ] Add a structured logger (e.g., `pino`) instead of raw `console.error` calls
  > 用结构化日志库（如 `pino`）替代分散的 `console.error`，便于生产环境日志收集和分析。

---

## 🟢 Low Priority — Infrastructure & Tooling

### Testing
- [ ] Set up a test runner (Vitest recommended for Next.js)
  > 配置测试框架（推荐 Vitest），为后续编写单元测试和集成测试打好基础。
- [ ] Write unit tests for core nutrition calculations: BMR (Mifflin-St Jeor), TDEE, macro splits
  > 为核心营养计算逻辑（BMR、TDEE、宏量营养素分配）编写单元测试，确保公式正确。
- [ ] Write unit tests for unit conversion utilities (`src/lib/units.ts`)
  > 为单位换算工具函数（公制/英制互转）编写单元测试，覆盖边界值。
- [ ] Add integration tests for critical API routes (`/api/profile`, `/api/generate-meal-ideas`)
  > 为核心 API 路由编写集成测试，验证完整的请求-响应链路是否正确。

### Monitoring & Observability
- [ ] Integrate an error tracking service (e.g., Sentry) for production error visibility
  > 接入错误追踪服务（如 Sentry），实时捕获生产环境中的异常并告警。
- [ ] Add structured request logging for API routes (timestamp, userId, latency, status)
  > 在 API 路由中记录结构化日志（时间戳、用户 ID、响应耗时、状态码），便于排查问题。
- [ ] Set up basic analytics (e.g., Posthog) to track feature usage
  > 接入基础数据分析工具（如 Posthog），追踪功能使用情况，辅助产品决策。

### Build & Deployment
- [ ] Add CI/CD pipeline (GitHub Actions) for lint, type-check, and test on every PR
  > 配置 GitHub Actions，在每个 PR 上自动执行 lint、类型检查和测试，防止问题合入主分支。
- [ ] Configure `next.config.ts` with response compression and image optimization settings
  > 在 `next.config.ts` 中配置响应压缩和图片优化，减小传输体积，提升加载速度。
- [ ] Add type-safe environment variable validation at build time (e.g., using `@t3-oss/env-nextjs`)
  > 在构建阶段对环境变量进行类型安全校验（如使用 `@t3-oss/env-nextjs`），在部署前暴露配置错误。

---

## 🔵 Future Features

- [ ] **Progress Tracking** — Log body weight over time and visualize trends
  > **进度追踪** — 记录体重随时间的变化，并以图表形式可视化展示趋势。
- [ ] **Nutrition History** — Track changes to nutrition goals and see historical snapshots
  > **营养历史** — 保留营养目标的修改记录，支持查看历史快照。
- [ ] **Dietary Preferences** — Store allergies, intolerances, and cuisine preferences in the user profile
  > **饮食偏好** — 在用户档案中保存过敏信息、不耐受食物和菜系偏好。
- [ ] **Meal Logging** — Allow users to log meals eaten and compare against daily targets
  > **饮食日记** — 允许用户记录实际摄入的餐食，并与每日营养目标对比。
- [ ] **Data Export** — Export nutrition plan and meal ideas as PDF or CSV
  > **数据导出** — 将营养计划和餐食建议导出为 PDF 或 CSV 文件。
- [ ] **PWA Support** — Add `manifest.json` and service worker for installable mobile experience
  > **PWA 支持** — 添加 `manifest.json` 和 Service Worker，支持将应用安装到手机桌面。
- [ ] **Notifications** — Email or push reminders for meal planning
  > **消息通知** — 通过邮件或推送提醒用户按时规划和记录餐食。
- [ ] **Multi-language Support** — i18n setup for non-English users
  > **多语言支持** — 配置国际化（i18n），支持中文等非英语用户。
- [ ] **Workout Integration** — Factor in exercise data for TDEE adjustments
  > **运动数据整合** — 接入运动记录，将实际消耗纳入 TDEE 计算，使营养目标更准确。
- [ ] **Accessibility Audit** — Audit and fix WCAG 2.1 AA compliance issues (ARIA labels, keyboard nav, focus management)
  > **无障碍审查** — 检查并修复 WCAG 2.1 AA 合规问题，包括 ARIA 标签、键盘导航和焦点管理。

---

## ✅ Quick Wins (High value, low effort)

- [ ] Add `.env.example` with placeholder values for all required variables
  > 添加 `.env.example` 文件，包含所有必需环境变量的占位示例值。
- [ ] Add request timeout to OpenAI client initialization
  > 在初始化 OpenAI 客户端时设置请求超时，防止请求无限挂起。
- [ ] Add `title` and `meta description` tags to all pages for SEO
  > 为所有页面添加 `title` 和 `meta description` 标签，提升搜索引擎收录效果。
- [ ] Add `aria-label` to icon-only buttons throughout the UI
  > 为所有纯图标按钮添加 `aria-label`，改善屏幕阅读器的可访问性。
- [ ] Extract all hardcoded limit/threshold values into `src/lib/constants.ts`
  > 将所有硬编码的限制值和阈值统一提取到 `src/lib/constants.ts`，方便集中管理和修改。
- [ ] Add JSDoc comments to all public utility functions in `src/lib/`
  > 为 `src/lib/` 下所有公共工具函数添加 JSDoc 注释，提升代码可读性和 IDE 提示质量。
