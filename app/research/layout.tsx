import Link from 'next/link';
import Logo from '@/research/components/Logo';
import ResearchLoader from '@/research/components/ResearchLoader';
import ResearchHeaderControls from '@/research/components/ResearchHeaderControls';
import ResearchReadingProgress from '@/research/components/ResearchReadingProgress';
import { TransitionLink } from '@/components/TransitionLink/TransitionLink';
import './research.css';
import { headers } from 'next/headers';

export default async function ResearchLayout({ children }: { children: React.ReactNode }) {
  const arabic = (await headers()).get('x-mz-locale') === 'ar';
  return (
    <div className="tnh-site">
      <ResearchLoader />
      <header className="research-navbar">
        <ResearchReadingProgress />
        <Link href={arabic ? '/research/ar' : '/research'} className="research-brand" aria-label={arabic ? 'الفرضية الصفرية' : 'The Null Hypothesis home'}>
          <Logo size={26} />
          <span className="research-wordmark">{arabic ? 'الفرضية الصفرية' : 'The Null Hypothesis'}</span>
        </Link>
        <nav aria-label="Research navigation" className="research-navlinks">
          <ResearchHeaderControls />
          <TransitionLink href="/">MZ ↗</TransitionLink>
        </nav>
      </header>
      {children}
      <footer className="research-footer">
        <TransitionLink href="/">
          © {new Date().getFullYear()} Model Zero for Technology Solutions
        </TransitionLink>
      </footer>
    </div>
  );
}
