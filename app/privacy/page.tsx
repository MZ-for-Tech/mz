"use client";

import styles from "./page.module.css";
import PillNav from "@/components/PillNav/PillNav";
import { Footer } from "@/components/Footer/Footer";
import DarkVeil from "@/components/DarkVeil/DarkVeil";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";

const NAV_ITEMS = [
  { label: 'Work', href: '/#work' },
  { label: 'Products', href: '/#products' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/start' }
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className={styles.container}>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", zIndex: -1 }}>
          <DarkVeil
            primaryColor="#afc020"
            noiseIntensity={0.05}
            scanlineIntensity={0.05}
            scanlineFrequency={0.01}
            speed={0.2}
            warpAmount={0.5}
          />
        </div>

        <PillNav
          items={NAV_ITEMS}
          baseColor="#0D0F08"
          pillColor="#F5F0E8"
          hoveredPillTextColor="var(--color-acid-green)"
          pillTextColor="#0D0F08"
        />

        <main className={styles.main}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.content}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you use our services, such as when you submit a project brief or contact us. This may include your name, email address, and project details.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to communicate with you about your projects, provide our services, and improve our website experience. We do not sell your personal information to third parties.</p>

            <h2>3. Information Security</h2>
            <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet is 100% secure.</p>

            <h2>4. Third-Party Services</h2>
            <p>We may use third-party services that collect, monitor and analyze information to improve our services functionality. These third-party service providers have their own privacy policies addressing how they use such information.</p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <ObfuscatedEmail user="hello" domain="mzltd.tech" />.</p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
