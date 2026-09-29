import Link from 'next/link';
import Logo from '@/research/components/Logo';
import ResearchLoader from '@/research/components/ResearchLoader';
import ResearchHeaderControls from '@/research/components/ResearchHeaderControls';
import { TransitionLink } from '@/components/TransitionLink/TransitionLink';
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
          <ResearchHeaderControls />
          <TransitionLink href="/home">MZ ↗</TransitionLink>
        </nav>
      </header>
      {children}
      <footer className="research-footer">
        <span>© {new Date().getFullYear()} Model Zero for Technology Solutions</span>
        <TransitionLink href="/home">Model Zero for Technology Solutions ↗</TransitionLink>
      </footer>
    </div>
  );
}
