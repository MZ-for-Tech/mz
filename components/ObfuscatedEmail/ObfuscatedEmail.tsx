interface ObfuscatedEmailProps {
  user?: string;
  domain?: string;
  className?: string;
}

export default function ObfuscatedEmail({
  user = "hello",
  domain = "mzfortech.com",
  className = "",
}: ObfuscatedEmailProps) {
  const email = `${user}@${domain}`;

  return (
    <a
      href={`mailto:${email}`}
      className={className}
    >
      {email}
    </a>
  );
}
