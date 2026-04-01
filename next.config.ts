import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking: disallow embedding this site in iframes
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME sniffing: browsers must respect declared content types
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Limit referrer info sent to other origins
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disable access to sensitive browser APIs not used by this app
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // CSP: restrict resource loading to trusted sources
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline/unsafe-eval for hydration scripts
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Tailwind CSS v4 uses inline styles
      "style-src 'self' 'unsafe-inline'",
      // Allow Google profile pictures
      "img-src 'self' data: https://lh3.googleusercontent.com",
      "font-src 'self'",
      "connect-src 'self'",
      // Redundant with X-Frame-Options but more modern
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
