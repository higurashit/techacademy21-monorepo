import Link from 'next/link';
import Head from 'next/head';

function Ssg({ data, diff_ms }) {
  return (
    <>
      <Head>
        <title>Static Site Generator Page.</title>
      </Head>

      <h1>Static Site Generator Page.</h1>
      <h2>
        Random Photo is ... id:{data.id}（{diff_ms}ms）
      </h2>

      <img
        src={data.url}
        alt={`Random Photo id:${data.id}`}
        width={500}
        height={300}
      />
      <h2>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </h2>
    </>
  );
}

// getStaticProps はSSG用のAPI（ビルド時に実行される）
export async function getStaticProps() {
  const start = Date.now();

  const id = Math.floor(Math.random() * 5000);
  const res = await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`);
  const data = await res.json();

  return {
    props: {
      data,
      diff_ms: Date.now() - start,
    },
  };
}

export default Ssg;
