import { BriefcaseIcon, CalendarIcon, InformationCircleIcon } from '@heroicons/react/solid'
import useWorkItems from '../hooks/useWorkItems'
import formatDate from '../utils/formatDate'
import Button from './Button'
import Tag from './Tag'

type Props = {}

const WorkItems = ({}: Props) => {
  const items = useWorkItems()

  return (
    <ul data-c={WorkItems.name} className="grid gap-6 grid-cols-work-items">
      {items.map(item => (
        <li key={item.id} className="flex flex-col bg-white/10 p-4 rounded-md shadow-md relative min-h-[100px]">
          <h3 className="text-lg tracking-wider text-slate-300 border-b border-white/10 flex items-center justify-center gap-2 pb-4">
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
              <time dateTime={item.from.toISOString()}>{formatDate(item.from)}</time> &ndash;{' '}
              {item.to ? <time dateTime={item.to.toISOString()}>{formatDate(item.to)}</time> : '∞'}
            </span>
          </div>

          <Button
            className="w-fit self-center mt-4 flex justify-center gap-2"
            to={`/?readMore=${item.id}`}
            scroll={false}
            shallow={true}
          >
            <InformationCircleIcon className="w-5 text-slate-500" /> Read more
          </Button>
        </li>
      ))}
    </ul>
  )
}

export default WorkItems
