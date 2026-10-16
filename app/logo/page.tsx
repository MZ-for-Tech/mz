import MzLogo3D from "@/components/Logo/MzLogo3D";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Zero Logo",
  robots: { index: false, follow: true },
};

export default function LogoPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "var(--color-black)", overflow: "hidden" }}>
      <MzLogo3D />
    </div>
  );
}
