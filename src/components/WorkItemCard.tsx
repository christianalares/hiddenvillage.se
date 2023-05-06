'use client'

import { formatDate } from '@/utils/formatDate'
import { TWorkItem } from '@/utils/notion/types'
import Link from 'next/link'
import { Emoji } from './Emoji'
import { GradientBorderedBox } from './GradientBorderedBox'
import { Icon } from './Icon'
import { Tag } from './Tag'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

type Props = {
  item: TWorkItem
}

export const WorkItemCard = ({ item }: Props) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    let { left, top } = currentTarget.getBoundingClientRect()

    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <li key={item.id} className="group min-h-[100px] overflow-hidden rounded-md shadow-md">
      <GradientBorderedBox className="relative flex h-full flex-col rounded-md p-4" onMouseMove={handleMouseMove}>
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
            radial-gradient(
              700px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.1),
              transparent 60%
            )
          `,
          }}
        />

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
              <Emoji emoji="⏳" label="ongoing" />
            )}
          </span>
        </div>
        <Link
          href={`/work/${item.slug}`}
          className="mt-4 flex w-fit gap-2 self-center rounded-md border border-[#232e53] px-3 py-1 text-slate-300 shadow-md shadow-slate-900/20 transition-colors hover:border-[#343f64] hover:text-slate-300 focus:border-slate-400 focus:text-slate-300"
          prefetch
        >
          <Icon name="informationCircle" className="w-4 text-slate-500" /> Read more{' '}
          <span className="sr-only">about {item.title}</span>
        </Link>
      </GradientBorderedBox>
    </li>
  )
}
