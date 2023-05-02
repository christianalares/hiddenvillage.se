import { Modal } from '@/components/Modal'
import { WorkItem } from '@/components/WorkItem'
import { getWorkItem } from '@/utils/notion/queries'

type Props = {
  params: {
    workId: string
  }
}

const WorkItemModal = async ({ params }: Props) => {
  const workItem = await getWorkItem(params.workId)

  return (
    <Modal isOpen>
      <WorkItem workItem={workItem} />
    </Modal>
  )
}

export default WorkItemModal
