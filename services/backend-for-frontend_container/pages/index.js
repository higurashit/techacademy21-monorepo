import Head from 'next/head';
import Link from 'next/link';

import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>BFF Test Page</title>
        <meta name="description" content="BFF Test Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Hello BFF Test Page!!</h1>
        <h2 className={styles.title}>
          <Link href="/bff/ssr">
            <a>SSR（Server Side Rendering）</a>
          </Link>
        </h2>
        <h1 className={styles.title}>
          <Link href="/bff/ssg">
            <a>SSG（Static Site Generator）</a>
          </Link>
        </h1>

        <h1 className={styles.title}>
          <Link href="/bff/isr">
            <a>SSG + ISR（Incremental Static Regeneration）</a>
          </Link>
        </h1>
      </main>
    </div>
  );
}
