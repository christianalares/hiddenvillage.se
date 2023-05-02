import { Container } from '@/components/Container'
import { Header } from '@/components/Header'
import { Icon } from '@/components/Icon'
import { WorkItem } from '@/components/WorkItem'
import { getWorkItem } from '@/utils/notion/queries'
import Link from 'next/link'

const WorkPage = async ({ params }: { params: { workId: string } }) => {
  const workItem = await getWorkItem(params.workId)

  return (
    <Container className="my-8 xs:my-16">
      <Header />

      <Link href="/" className="mt-8 flex w-max items-center gap-2 transition-colors hover:text-slate-400">
        <Icon name="arrowLeft" className="h-6" />
        Back
      </Link>

      <WorkItem workItem={workItem} className="mt-8" />
    </Container>
  )
}

export default WorkPage
