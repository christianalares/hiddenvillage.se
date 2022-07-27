import { Dialog } from '@headlessui/react'
import { CalendarIcon, DocumentTextIcon, ExternalLinkIcon, LinkIcon, UserIcon } from '@heroicons/react/outline'
import { CodeIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import useWorkItems from '../hooks/useWorkItems'
import formatDate from '../utils/formatDate'
import { WorkItem } from '../utils/notion/getEntriesFromDb'
import Modal from './Modal'
import Tag from './Tag'

type Props = {
  items: WorkItem[]
}

const CurrentWorkItemModal = ({ items }: Props) => {
  const { query } = useRouter()
  // const workItems = useWorkItems()

  const item = items.find(workItem => workItem.id === query.readMore)

  return (
    <Modal isOpen={!!item}>
      {!item ? null : (
        <>
          <Dialog.Title className="text-slate-200 text-3xl">{item.title}</Dialog.Title>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <CalendarIcon className="w-4 text-slate-500" />
            <time dateTime={new Date(item.date.from).toISOString()} className="text-sm">
              {formatDate(item.date.from)}
            </time>
            &ndash;{' '}
            {item.date.to ? (
              <time dateTime={new Date(item.date.to).toISOString()} className="text-sm">
                {formatDate(item.date.to)}
              </time>
            ) : (
              '∞'
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-slate-200 text-xl mb-2 flex items-center gap-1">
              <DocumentTextIcon className="w-6 text-slate-500" /> Description:
            </h3>
            <div className="space-y-4">
              {item.paragraphs.map(paragraph => (
                <p key={paragraph.substring(0, 7)} className="text-slate-100">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-slate-200 text-xl mb-2 flex items-center gap-1">
              <UserIcon className="w-6 text-slate-500" /> Role:
            </h3>
            <p className="text-slate-100">{item.role}</p>
          </div>

          <div className="mt-8">
            <h3 className="text-slate-200 text-xl mb-2 flex items-center gap-1">
              <CodeIcon className="w-6 text-slate-500" /> Techniques used:
            </h3>
            <ul className="flex flex-wrap gap-2 mt-4">
              {item.skills.map(skill => (
                <Tag as="li" key={skill} tag={skill} className="bg-slate-500 text-slate-200" />
              ))}
            </ul>
          </div>

          {item.url && (
            <div className="mt-8">
              <h3 className="text-slate-200 text-xl mb-2 flex items-center gap-1">
                <LinkIcon className="w-6 text-slate-500" /> Link:
              </h3>
              <a className="text-slate-100 flex items-center gap-2 focus:ring-slate-500 w-fit" href={item.url}>
                <ExternalLinkIcon className="w-4 text-slate-500" /> {item.url}
              </a>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

export default CurrentWorkItemModal