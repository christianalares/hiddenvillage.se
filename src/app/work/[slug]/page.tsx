import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import { WorkItem } from '@/components/WorkItem'
import { getWorkItem, getWorkItems } from '@/utils/notion/queries'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 10

export const generateStaticParams = async () => {
  const workItems = await getWorkItems()

  return workItems.map(workItem => ({
    slug: workItem.id,
  }))
}

const WorkPage = async ({ params }: { params: { slug: string } }) => {
  const workItem = await getWorkItem(params.slug)

  if (!workItem) {
    notFound()
  }

  return (
    <Container className="my-8 xs:my-16">
      <Link href="/" className="group mt-8 flex w-max items-center gap-2 transition-colors hover:text-slate-300">
        <Icon name="arrowLeft" className="h-6 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <WorkItem workItem={workItem} className="mt-8" />
    </Container>
  )
}

export default WorkPage
