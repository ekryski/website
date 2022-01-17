import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { getAllTags } from '@/lib/tags'

export const POSTS_PER_PAGE = 5

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')
  const tags = await getAllTags('blog')
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return { props: { initialDisplayPosts, posts, pagination, tags } }
}

export default function Blog({ posts, initialDisplayPosts, pagination, tags }) {
  return (
    <>
      <PageSEO title={`Insights - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        tags={tags}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="Insights"
      />
    </>
  )
}
