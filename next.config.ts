import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Ngrok to connect for HMR
  // @ts-ignore - this is a valid Next.js flag that might not be in the types yet
  allowedDevOrigins: ['restorable-nonconcentrically-katalina.ngrok-free.dev'],
};

export default nextConfig;
