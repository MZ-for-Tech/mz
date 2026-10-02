// Retain the existing import path while providing a readable email fallback.
export default function ObfuscatedEmail({ user = 'hello', domain = 'mzfortech.com', className = '' }: { user?: string; domain?: string; className?: string }) {
  const email = `${user}@${domain}`;
  return <a href={`mailto:${email}`} className={className}>{email}</a>;
}
