'use client'

import { Dialog } from '@headlessui/react'
import { useSearchParams } from 'next/navigation'
import formatDate from '../utils/formatDate'
import { WorkItem } from '../utils/notion/getEntriesFromDb'
import Modal from './Modal'
import Tag from './Tag'
import { Icon } from './Icon'

type Props = {
  items: WorkItem[]
}

const CurrentWorkItemModal = ({ items }: Props) => {
  const searchParams = useSearchParams()
  const readMore = searchParams?.get('readMore')

  const item = items.find(workItem => workItem.id === readMore)

  return (
    <Modal isOpen={!!item}>
      {!item ? null : (
        <>
          <Dialog.Title className="text-3xl text-slate-200">{item.title}</Dialog.Title>
          <div className="mt-2 flex items-center gap-2 text-slate-400">
            <Icon name="calendar" className="w-4 text-slate-500" />
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
            <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
              <Icon name="documentText" className="w-6 text-slate-500" /> Description:
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
            <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
              <Icon name="user" className="w-6 text-slate-500" /> Role:
            </h3>
            <p className="text-slate-100">{item.role}</p>
          </div>

          <div className="mt-8">
            <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
              <Icon name="codeBracket" className="w-6 text-slate-500" /> Techniques used:
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.skills.map(skill => (
                <Tag as="li" key={skill} tag={skill} className="bg-slate-700 text-slate-200" />
              ))}
            </ul>
          </div>

          {item.url && (
            <div className="mt-8">
              <h3 className="mb-2 flex items-center gap-1 text-xl text-slate-200">
                <Icon name="link" className="w-6 text-slate-500" /> Link:
              </h3>
              <a className="flex w-fit items-center gap-2 text-slate-100 focus:ring-slate-500" href={item.url}>
                <Icon name="externalLink" className="w-4 text-slate-500" /> {item.url}
              </a>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

export default CurrentWorkItemModal
