import { Container } from '@/components/Container'
import type { Metadata } from 'next'
import { getWorkItems } from '@/utils/notion/queries'
import { Introduction } from '@/components/Introduction'
import { Footer } from '@/components/Footer'
import { WorkItems } from '@/components/WorkItems'

export const metadata: Metadata = {
  title: 'Hidden Village',
  description: 'Hidden Village is a personal website of Christian Alares',
  openGraph: {
    title: 'Hidden Village',
    description: 'Hidden Village is a personal website of Christian Alares',
    images: '/me.jpg',
  },
  icons: '/favicon/me-32x32.jpg',
}

export const revalidate = 10

const IndexPage = async () => {
  const workItems = await getWorkItems()

  return (
    <>
      <Container>
        <Introduction />

        <WorkItems items={workItems} />

        <hr />

        <Footer />
      </Container>
    </>
  )
}

export default IndexPage
