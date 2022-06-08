import { format } from 'date-fns'
import { BriefcaseIcon, CalendarIcon } from '@heroicons/react/outline'
import Tag from './Tag'
import Emoji from './Emoji'

export type Item = {
  id: string
  title: string
  url?: string
  from: Date
  to?: Date
  role: string
  tags: string[]
}

type Props = {
  items: Item[]
}

const WorkItems = ({ items }: Props) => {
  return (
    <ul data-c={WorkItems.name} className="grid gap-6 grid-cols-work-items">
      {items.map(item => (
        <li key={item.id} className="flex flex-col bg-white/10 p-4 rounded-md shadow-md relative min-h-[100px]">
          <h3 className="text-lg tracking-wider text-slate-300 border-b border-white/10 flex items-center justify-center gap-2 pb-2">
            <BriefcaseIcon className="w-4 text-slate-500" />
            {item.title}
          </h3>
          <ul className="flex flex-wrap gap-2 my-6">
            {item.tags.map(tag => (
              <Tag as="li" key={tag} tag={tag} />
            ))}
          </ul>
          <div className="mt-auto text-sm text-slate-400 flex items-center gap-2">
            <CalendarIcon className="w-4 text-slate-500" />
            <span>
              <time dateTime={item.from.toISOString()}>{format(item.from, 'MMM y')}</time> &ndash;{' '}
              {item.to ? <time dateTime={item.to.toISOString()}>{format(item.to, 'MMM y')}</time> : '∞'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default WorkItems
