import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="not-found-title">
        <p className={styles.eyebrow}>
          <span className={styles.status} aria-hidden="true" />
          ROUTE NOT FOUND
        </p>

        <h1 className={styles.code} id="not-found-title">404</h1>

        <footer className={styles.footer}>
          <div className={styles.copy}>
            <p className={styles.title}>This page doesn&apos;t exist.</p>
            <p className={styles.description}>
              The address may be wrong, or the page may have moved. Explore Model Zero&apos;s <TransitionLink href="/services">services</TransitionLink>, <TransitionLink href="/work">work</TransitionLink> or <TransitionLink href="/contact">contact page</TransitionLink>.
            </p>
          </div>
          <TransitionLink href="/" className={styles.homeLink}>
            <span>Return to start</span>
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </TransitionLink>
        </footer>
      </section>
    </main>
  );
}
