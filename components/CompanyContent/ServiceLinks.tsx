import Link from 'next/link';
import { SERVICE_PAGES } from '@/lib/service-pages';
import styles from './CompanyContent.module.css';

export default function ServiceLinks() {
  return <div className={styles.grid}>{SERVICE_PAGES.map(service => <article className={styles.card} key={service.slug}>
    <h3><Link href={`/services/${service.slug}`}>{service.title.split(' | ')[0]}</Link></h3>
    <p>{service.description}</p>
  </article>)}</div>;
}
