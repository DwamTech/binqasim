import type { NextConfig } from "next";
import { createNextSecurityHeaders } from "./src/server/security/security-headers";

const environment =
  process.env.NODE_ENV === "production" ? "production" : "development";
const backendApiUrl = process.env.BACKEND_API_URL;
const securityHeaders = createNextSecurityHeaders(
  environment,
  backendApiUrl === undefined ? {} : { mediaOrigin: backendApiUrl },
);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10gb",
    },
    proxyClientMaxBodySize: "10gb",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
