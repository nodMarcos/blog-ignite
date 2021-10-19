import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import {format} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}


export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination);

  async function requestPosts() {
    let res = await fetch(posts.next_page);

    let data = await res.json();
    let post = data.results[0];

    data.results[0].first_publication_date = format(
          new Date(post.first_publication_date),
            'dd MMM. yyyy',
            {
              locale: ptBR,
            }
        )
    setPosts({
      results: [...posts.results, data.results[0]],
      next_page: data.next_page,
    });
  }
  // TODO
  //console.log(postsPagination.next_page)
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.containerPosts}>
          {posts.results.map(post => (
            <div key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a href="#">
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time><FiCalendar />{format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                    locale: ptBR
                  })}</time>
                  <p><FiUser />{post.data.author}</p>
                </div>
              </a>
            </Link>
            </div>
          ))}
          {
          !!posts.next_page && (
            <button type="button" onClick={requestPosts}>
              Carregar mais posts
            </button>
          )
          }
        </div>

      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.content', 'posts.author', 'posts.subtitle', 'posts.next_page'],
    pageSize: 1
  });

  // TODO

  const posts = postsResponse.results.map(post => {

    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    }
  })
  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      }
    },
  }
};
