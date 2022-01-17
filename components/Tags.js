import Link from 'next/link'
import Tag from '@/components/Tag'
import kebabCase from '@/lib/utils/kebabCase'

const Tags = ({ tags }) => {
  const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a])
  return (
    <div className="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:divide-y-0 md:flex-row md:space-x-6 md:mt-24">
      <div className="pt-4 pb-6 space-x-2 md:space-y-5">
        <h2 className="text-2xl font-bold leading-4 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-6 md:text-4xl md:leading-8 md:border-r-2 md:pr-6">
          Tags
        </h2>
      </div>
      <div className="flex flex-wrap max-w-lg">
        {Object.keys(tags).length === 0 && 'No tags found.'}
        {sortedTags.map((t) => {
          return (
            <div key={t} className="mt-1 mb-1 mr-3">
              <Tag text={t} />
              <Link
                href={`/tags/${kebabCase(t)}`}
                className="mr-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
              >
                {`(${tags[t]})`}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tags
