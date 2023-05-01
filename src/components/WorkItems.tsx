// import Link from 'next/link'
import formatDate from '../utils/formatDate'
import { WorkItem } from '../utils/notion/getEntriesFromDb'
import Button from './Button'
import { Icon } from './Icon'
import Tag from './Tag'

type Props = {
  items: WorkItem[]
}

const WorkItems = ({ items }: Props) => {
  return (
    <ul data-c={WorkItems.name} className="grid gap-6 grid-cols-work-items">
      {items.map(item => (
        <li key={item.id} className="flex flex-col bg-white/10 p-4 rounded-md shadow-md relative min-h-[100px]">
          <h3 className="text-lg tracking-wider text-slate-300 border-b border-white/10 flex items-center justify-center gap-2 pb-4">
            <Icon name="briefcase" className="w-4 text-slate-500" />
            {item.title}
          </h3>
          <ul className="flex flex-wrap gap-2 my-6">
            {item.skills.map(tag => (
              <Tag as="li" key={tag} tag={tag} />
            ))}
          </ul>
          <div className="mt-auto text-sm text-slate-400 flex items-center gap-2">
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

          {/* <Link href={`/?readMore=${item.id}`}>
            <Icon name="informationCircle" className="w-4 text-slate-500" /> Read more{' '}
            <span className="sr-only">about {item.title}</span>
          </Link> */}
          <Button
            className="w-fit self-center mt-4 flex justify-center gap-2"
            to={`/?readMore=${item.id}`}
            scroll={false}
            shallow={true}
          >
            <Icon name="informationCircle" className="w-4 text-slate-500" /> Read more{' '}
            <span className="sr-only">about {item.title}</span>
          </Button>
        </li>
      ))}
    </ul>
  )
}

export default WorkItems
