'use client'

import type { TWorkItem } from '@/utils/notion/types'
import { WorkItemCard } from './WorkItemCard'
import { stagger, useAnimate, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'

type Props = {
  items: TWorkItem[]
}

export const WorkItems = ({ items }: Props) => {
  const [ref, animate] = useAnimate()
  const isInView = useInView(ref)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      animate(
        '.work-item-card',
        {
          opacity: [0, 1],
        },
        {
          duration: 2,
          delay: stagger(0.1),
        }
      )

      hasAnimated.current = true
    }
  }, [animate, isInView])

  return (
    <ul ref={ref} className="grid grid-cols-work-items gap-6">
      {items.map(item => (
        <WorkItemCard key={item.id} item={item} />
      ))}
    </ul>
  )
}
