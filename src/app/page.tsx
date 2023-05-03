import { Container } from '@/components/Container'
import { Emoji } from '@/components/Emoji'
import { WorkItems } from '@/components/WorkItems'
import { Icon } from '@/components/Icon'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { getWorkItems } from '@/utils/notion/queries'
import { Introduction } from '@/components/Introduction'
import { Footer } from '@/components/Footer'

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

  if (!workItems) {
    return null
  }

  return (
    <>
      <Container className="my-8 xs:my-16">
        <Header />

        <Introduction />
        <WorkItems items={workItems} />

        <hr />

        <Footer />
      </Container>
    </>
  )
}

export default IndexPage
