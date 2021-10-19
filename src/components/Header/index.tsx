import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
