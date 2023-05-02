import Link from 'next/link'
import { formatDate } from '@/utils/formatDate'
import { Icon } from '@/components/Icon'
import { Tag } from '@/components/Tag'
import type { TWorkItem } from '@/utils/notion/types'

type Props = {
  items: TWorkItem[]
}

export const WorkItems = ({ items }: Props) => {
  return (
    <ul className="grid grid-cols-work-items gap-6">
      {items.map(item => (
        <li key={item.id} className="relative flex min-h-[100px] flex-col rounded-md bg-white/10 p-4 shadow-md">
          <h3 className="flex items-center justify-center gap-2 border-b border-white/10 pb-4 text-lg tracking-wider text-slate-300">
            <Icon name="briefcase" className="w-4 text-slate-500" />
            {item.title}
          </h3>
          <ul className="my-6 flex flex-wrap gap-2">
            {item.skills.map(tag => (
              <Tag as="li" key={tag} tag={tag} />
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2 text-sm text-slate-400">
            <Icon name="calendar" className="w-4 text-slate-500" />
            <span>
              <time dateTime={new Date(item.date.from).toISOString()}>{formatDate(item.date.from)}</time> &ndash;{' '}
              {item.date.to ? (
                <time dateTime={new Date(item.date.to).toISOString()}>{formatDate(item.date.to)}</time>
              ) : (
                '∞'
              )}
            </span>
          </div>

          <Link
            href={`/work/${item.id}`}
            className="mt-4 flex w-fit gap-2 self-center rounded-md border border-slate-500 px-3 py-1 text-slate-300 shadow-md shadow-slate-900/20 transition-colors hover:border-slate-400 hover:text-slate-300 focus:border-slate-400 focus:text-slate-300"
            prefetch
          >
            <Icon name="informationCircle" className="w-4 text-slate-500" /> Read more{' '}
            <span className="sr-only">about {item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
