import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Ngrok to connect for HMR
  allowedDevOrigins: ['restorable-nonconcentrically-katalina.ngrok-free.dev'],
};

export default nextConfig;
