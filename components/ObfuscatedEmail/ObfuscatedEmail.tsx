"use client";

import { useState } from "react";

interface ObfuscatedEmailProps {
  user?: string;
  domain?: string;
  className?: string;
}

export default function ObfuscatedEmail({
  user = "hello",
  domain = "mzltd.tech",
  className = "",
}: ObfuscatedEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = `${user}@${domain}`;
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Obfuscate in HTML by reversing the string and using CSS to flip it back for humans
  const email = `${user}@${domain}`;
  const reversedEmail = email.split("").reverse().join("");

  return (
    <a
      href="#"
      onClick={handleCopy}
      className={className}
      title="Click to copy email"
      style={{ cursor: "pointer", display: "inline-block" }}
    >
      {copied ? (
        "Copied to clipboard!"
      ) : (
        <span style={{ direction: "rtl", unicodeBidi: "bidi-override" }}>
          {reversedEmail}
        </span>
      )}
    </a>
  );
}
