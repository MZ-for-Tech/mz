import Link from 'next/link';
import Logo from '@/research/components/Logo';
import ResearchLoader from '@/research/components/ResearchLoader';
import './research.css';

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tnh-site">
      <ResearchLoader />
      <header className="research-navbar">
        <Link href="/research" className="research-brand">
          <Logo size={26} />
          <span className="research-wordmark">The Null Hypothesis</span>
        </Link>
        <nav aria-label="Research navigation" className="research-navlinks">
          <Link href="/research">EN</Link>
          <Link href="/research/ar">عربي</Link>
          <Link href="/">MZ ↗</Link>
        </nav>
      </header>
      {children}
      <footer className="research-footer">
        <span>© {new Date().getFullYear()} MZ for Tech Solutions</span>
        <Link href="/">MZ for Tech Solutions ↗</Link>
      </footer>
    </div>
  );
}
