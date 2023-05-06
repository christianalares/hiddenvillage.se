import { Icon } from '@/components/Icon'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatDate'
import { TWorkItem } from '@/utils/notion/types'
import { Tag } from './Tag'

type Props = {
  workItem: TWorkItem
  className?: string
}

export const WorkItem = ({ workItem, className }: Props) => {
  return (
    <div className={cn(className)}>
      <h2 className="text-3xl text-slate-200">{workItem.title}</h2>

      <div className="mt-2 flex items-center gap-2 text-slate-400">
        <Icon name="calendar" className="w-4 text-slate-500" />
        <time dateTime={new Date(workItem.date.from).toISOString()} className="text-sm">
          {formatDate(workItem.date.from)}
        </time>
        &ndash;{' '}
        {workItem.date.to ? (
          <time dateTime={new Date(workItem.date.to).toISOString()} className="text-sm">
            {formatDate(workItem.date.to)}
          </time>
        ) : (
          '∞'
        )}
      </div>

      <div className="mt-8">
        <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
          <Icon name="documentText" className="w-6 text-slate-500" /> Description:
        </h3>
        <div className="space-y-4">
          {workItem.paragraphs.map(paragraph => (
            <p key={paragraph.substring(0, 7)} className="text-slate-100">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
          <Icon name="user" className="w-6 text-slate-500" /> Role:
        </h3>
        <p className="text-slate-100">{workItem.role}</p>
      </div>

      <div className="mt-8">
        <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
          <Icon name="codeBracket" className="w-6 text-slate-500" /> Techniques used:
        </h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {workItem.skills.map(skill => (
            <Tag as="li" key={skill} tag={skill} className="bg-slate-700 text-slate-200" />
          ))}
        </ul>
      </div>

      {workItem.url && (
        <div className="mt-8">
          <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
            <Icon name="link" className="w-6 text-slate-500" /> Link:
          </h3>
          <a className="flex w-fit items-center gap-2 text-slate-100 focus:ring-slate-500" href={workItem.url}>
            <Icon name="externalLink" className="w-4 text-slate-500" /> {workItem.url}
          </a>
        </div>
      )}
    </div>
  )
}
