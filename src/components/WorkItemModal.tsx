'use client'

import { TWorkItem } from '@/utils/notion/types'
import { Modal } from './Modal'
import { WorkItem } from './WorkItem'

type Props = {
  workItem: TWorkItem
}

export const WorkItemModal = ({ workItem }: Props) => {
  return (
    <Modal isOpen>
      <WorkItem workItem={workItem} />
    </Modal>
  )
}
