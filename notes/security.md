# 安全响应头 (Security Headers)

HTTP 响应头是服务器返回给浏览器的"指令"。安全响应头告诉浏览器"在显示这个页面时，你被允许做什么、不允许做什么"。

---

## 具体的几种攻击和对应的防御头

### 1. 点击劫持 (Clickjacking) → `X-Frame-Options`

**攻击原理：**
攻击者创建一个恶意网站，用 `<iframe>` 把你的网站（比如 fitlyst.com）嵌入其中，但设置为完全透明。用户以为在点击攻击者的网站，实际上点击的是下面透明的你的网站。

```
攻击者页面: "点击领奖！" [按钮]
透明叠加层:  fitlyst.com 的 "确认支付" [按钮]  ← 用户实际点击的
```

**防御：** `X-Frame-Options: DENY` 告诉浏览器"不允许任何人把我嵌入 iframe"。

---

### 2. MIME 类型嗅探 (MIME Sniffing) → `X-Content-Type-Options`

**攻击原理：**
服务器返回一个文件，说它是 `text/plain`（普通文本），但文件内容其实是 JavaScript 代码。旧版浏览器会"聪明地"猜测说"这看起来像 JS，我来执行它！"——这就是嗅探。攻击者可以借此上传一个"伪装成图片"的恶意脚本并让其执行。

**防御：** `X-Content-Type-Options: nosniff` 告诉浏览器"我说是什么类型就是什么类型，不要自己猜"。

---

### 3. 内容安全策略 (CSP, Content Security Policy)

**攻击原理（XSS 跨站脚本攻击）：**
如果你的网站有输入框，攻击者输入 `<script>偷cookie的代码</script>`，如果没有过滤，这段代码就会在其他用户的浏览器里执行。

**CSP 的防御：** 你告诉浏览器"这个网站只允许加载来自我自己域名的脚本，其他来源的一律拒绝执行"。

```
Content-Security-Policy: script-src 'self' https://trusted-cdn.com
```

即使攻击者注入了 `<script>`，浏览器也会拒绝执行，因为它不在白名单里。

---

### 4. Referrer 信息泄露 → `Referrer-Policy`

**攻击原理：**
当用户从你的网站点击链接跳转到其他网站时，浏览器默认会在请求头里附上 `Referer`，告诉对方"用户是从哪个 URL 过来的"。如果你的 URL 里含有敏感信息（如用户 ID、token、查询参数），就会被第三方网站看到。

**防御：** `Referrer-Policy: strict-origin-when-cross-origin` 表示：
- 同域跳转：发送完整 URL
- 跨域跳转：只发送域名（不含路径和参数）
- HTTP 跳转到 HTTPS：不发送任何信息

---

### 5. 浏览器 API 滥用 → `Permissions-Policy`

**攻击原理：**
浏览器提供了摄像头、麦克风、地理位置等强大 API。如果你的网站被 XSS 攻击或者嵌入了恶意第三方脚本，这些脚本可能悄悄调用这些 API 来监控用户。

**防御：** `Permissions-Policy` 允许你显式声明哪些 API 可以被使用。对于 Fitlyst 这样不需要任何硬件权限的应用，可以全部禁用：

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

括号内为空表示"任何来源都不允许使用"，即使恶意脚本请求权限，浏览器也会直接拒绝。

---

## 在 Next.js 里怎么加

在 `next.config.ts` 里统一配置，通过 `headers()` 函数覆盖所有路由：

```ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js hydration 需要
      "style-src 'self' 'unsafe-inline'",                // Tailwind CSS v4 需要
      "img-src 'self' data: https://lh3.googleusercontent.com", // Google 头像
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

// 在 nextConfig 里：
async headers() {
  return [{ source: '/(.*)', headers: securityHeaders }]
}
```

这样所有页面都会自动带上这些响应头，无需修改每个 API 路由。

---

## 总结

| 响应头 | 防御目标 |
|---|---|
| `X-Frame-Options` | 点击劫持 |
| `X-Content-Type-Options` | MIME 类型嗅探 |
| `Content-Security-Policy` | XSS 跨站脚本攻击 |
| `Referrer-Policy` | URL 敏感信息泄露 |
| `Permissions-Policy` | 摄像头/麦克风/定位等 API 滥用 |

这些响应头是低成本、高价值的防御层——不需要改业务逻辑，只需几行配置，就能挡住多类常见的 Web 攻击。
