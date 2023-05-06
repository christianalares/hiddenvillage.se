import { Modal } from '@/components/Modal'
import { WorkItem } from '@/components/WorkItem'
import { getWorkItem, getWorkItems } from '@/utils/notion/queries'
import { notFound } from 'next/navigation'

export const revalidate = 10

export const generateStaticParams = async () => {
  const workItems = await getWorkItems()

  return workItems.map(workItem => ({
    slug: workItem.slug,
  }))
}

const WorkItemInterceptionModal = async ({ params }: { params: { slug: string } }) => {
  const workItem = await getWorkItem(params.slug)

  if (!workItem) {
    notFound()
  }

  return (
    <Modal isOpen>
      <WorkItem workItem={workItem} />
    </Modal>
  )
}

export default WorkItemInterceptionModal
