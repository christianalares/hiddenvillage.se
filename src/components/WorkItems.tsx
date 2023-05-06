import Link from 'next/link'
import { formatDate } from '@/utils/formatDate'
import { Icon } from '@/components/Icon'
import { Tag } from '@/components/Tag'
import type { TWorkItem } from '@/utils/notion/types'
import { Emoji } from './Emoji'
import { WorkItemCard } from './WorkItemCard'

type Props = {
  skeleton?: never
  items: TWorkItem[]
}

export const WorkItems = ({ items }: Props) => {
  return (
    <ul className="grid grid-cols-work-items gap-6">
      {items.map(item => (
        <WorkItemCard key={item.id} item={item} />
      ))}
    </ul>
  )
}
