import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import React from 'react';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const postContent = post.data.content.reduce((previous, current) => {
    return previous + RichText.asText(current.body).split(/[^\w]*[\s+]/g).length;
  }, 0);

  const postHeading = post.data.content.reduce((previous, current) => {
    return previous + current.heading.split(/[^\w]*[\s+]/g).length;
  }, 0);

  const postRevalidate = Math.ceil((postHeading + postContent) / 200);

  if (router.isFallback) {
    return <h1 className={styles.loadingScreen}>Carregando...</h1>
  }
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      {!!post.data.banner.url ? (
        <img className={styles.banner} src={post.data.banner.url} alt="" />
      ) : (
        ''
      )
      }
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time><FiCalendar />{format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR
            })}</time>
            <p><FiUser />{post.data.author}</p>
            <p><FiClock/>{postRevalidate} min</p>
          </div>

          {
            post.data.content.map((word) => (
              <div key={word.heading}>
                <h3>{word.heading}</h3>
                <div className={styles.content} dangerouslySetInnerHTML={{ __html: RichText.asHtml(word.body) }} />
              </div>
            ))
          }

        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async (context) => {
  return {
    paths: [
      {
        "params":  {
          "slug": "como-utilizar-hooks",
        },
      },
       {
        "params":  {
          "slug": "criando-um-app-cra-do-zero",
        },
      },
    ],
    fallback: true
  }
  // TODO
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params
  const response = await prismic.getByUID('posts', String(slug), {});

  // TODO

  if (response.data.banner.url) {
    const post = {
      uid: response.uid,
      data: {
        title: response.data.title,
        subtitle: response.data.subtitle,
        author: response.data.author,
        banner: {
          url: response.data.banner.url
        },
        content: response.data.content,
      },
      first_publication_date: response.first_publication_date
    }


    return {
      props: {
        post,
      },
    }
  }
  else {
    const post = {
      slug,
      data: {
        title: response.data.title,
        subtitle: response.data.subtitle,
        author: response.data.author,
        banner: {
          url: null
        },
        content: response.data.content,
      },
      first_publication_date: response.first_publication_date
    }

    return {
      props: {
        post,
      },
    }
  }
};
