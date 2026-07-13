"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 
        Instead of wrapping children and risking breaking `position: fixed` or GSAP ScrollTriggers,
        we use an overlay curtain that fades out when the page mounts. 
        This is perfectly safe for complex WebGL and GSAP setups.
      */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: "-100%" }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#0D0F08", // Matches the app's base background
          zIndex: 99999,
          pointerEvents: "none",
          transform: "translateY(0%)",
        }}
      />
      {children}
    </>
  );
}
