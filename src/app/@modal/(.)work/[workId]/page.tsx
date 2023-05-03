import { WorkItemModal } from '@/components/WorkItemModal'
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

  return <WorkItemModal workItem={workItem} />
}

export default WorkItemInterceptionModal
