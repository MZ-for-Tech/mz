"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Root layouts persist during client navigation; keep later language switches correct too. */
export default function DocumentLanguage() {
  const path = usePathname();
  useEffect(() => {
    const arabic = path === "/ar" || path.startsWith("/ar/") || path === "/research/ar" || path.startsWith("/research/ar/");
    document.documentElement.lang = arabic ? "ar" : "en";
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [path]);
  return null;
}
