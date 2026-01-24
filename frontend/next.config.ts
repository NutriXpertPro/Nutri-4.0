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
  // Força o uso do Webpack em vez do Turbopack para resolver conflitos com PWA
  webpack: (config, { isServer }) => {
    return config;
  },
  // Adicionando configuração vazia para silenciar o erro do Turbopack
  turbopack: {},
};

export default withPWA(nextConfig);
