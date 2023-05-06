import { Modal } from '@/components/Modal'
import { WorkItem } from '@/components/WorkItem'
import { getWorkItem } from '@/utils/notion/queries'

export const revalidate = 10

type Props = {
  params: {
    workId: string
  }
}

const WorkItemInterceptionModal = async ({ params }: Props) => {
  const workItem = await getWorkItem(params.workId)

  if (!workItem) {
    return null
  }

  return (
    <Modal isOpen>
      <WorkItem workItem={workItem} />
    </Modal>
  )
}

export default WorkItemInterceptionModal
