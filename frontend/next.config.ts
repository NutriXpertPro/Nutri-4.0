import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Desabilitado em dev, habilitado em produção
  register: true,
  scope: "/",
  sw: "service-worker.js",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  turbopack: {}, // Silencia erro do Turbopack com PWA
};

export default withPWA(nextConfig);
