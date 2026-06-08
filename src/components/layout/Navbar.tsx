"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Command, ChevronRight, Sun, Moon } from "lucide-react";

const navLinks = [
  { name: "Services", href: "#services" },
  { name: "Work", href: "#projects" },
  { name: "Process", href: "#process" },
  { name: "Contact", href: "#contact" },
];

import { useTheme } from "next-themes";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  // Hydration mismatch fix: only show theme toggle after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. SCROLL LISTENER
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. SMOOTH SCROLL HANDLER (Hashtag Masking)
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({
          behavior: "smooth",
        });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`
          relative w-full max-w-5xl border px-2 py-1 transition-all duration-300 pointer-events-auto
          ${scrolled
            ? "bg-[var(--surface)] border-[var(--primary)] shadow-md"
            : "bg-transparent border-transparent"
          }
        `}
      >
        <div className="flex items-center justify-between px-4">
          {/* === LOGO === */}
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "#hero")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {/* Fixed slot — change scale-X on the img to resize visually */}
            <div className="h-10 w-10 overflow-hidden flex-shrink-0">
              <img src="/mz-logo.png" alt="MZ Logo" className="w-full h-full object-contain scale-170 group-hover:rotate-12 transition-transform origin-center" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">
              MZ
            </span>
            <span className="text-[10px] italic text-[var(--muted)] font-medium -translate-y-0.5 ml-1 opacity-80">
              (it&apos;s em-zed)
            </span>
          </a>

          {/* === DESKTOP LINKS === */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--surface)] rounded-full px-2 py-1 border border-[var(--border)]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="relative px-4 py-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
              >
                {link.name}
                <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>

          {/* === RIGHT ACTIONS === */}
          <div className="hidden md:flex items-center gap-3">


            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors overflow-hidden"
            >
              <AnimatePresence initial={false}>
                {mounted && theme === "dark" ? (
                  <motion.div
                    key="sun"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0, rotate: 90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* CTA Button */}
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "#contact")}
              className="relative group overflow-hidden rounded-full bg-[var(--foreground)] text-[var(--background)] px-5 py-1.5 text-sm font-bold flex items-center gap-1"
            >
              <span className="relative z-10">Let's Work</span>
              <ChevronRight size={14} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[var(--background)]/40 to-transparent skew-x-12" />
            </a>
          </div>

          {/* === MOBILE TOGGLE === */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[var(--foreground)] p-2"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* === MOBILE MENU === */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="p-4 space-y-4 bg-[var(--surface)] mt-2 border border-[var(--primary)] shadow-xl">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="block text-[var(--muted)] hover:text-[var(--foreground)] py-2 font-medium"
                  >
                    {link.name}
                  </a>
                ))}

                {/* Mobile Theme Toggle */}
                <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                  <span className="text-[var(--muted)] text-sm">Theme Mode</span>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 bg-[var(--background)] rounded-full text-[var(--foreground)] border border-[var(--border)]"
                  >
                    {mounted && theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    const elem = document.getElementById("contact");
                    if (elem) elem.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-xl font-bold"
                >
                  Let's Work
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}