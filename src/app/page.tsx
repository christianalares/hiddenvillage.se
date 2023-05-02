import { Container } from '@/components/Container'
import { Emoji } from '@/components/Emoji'
import { WorkItems } from '@/components/WorkItems'
import { Icon } from '@/components/Icon'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { getWorkItems } from '@/utils/notion/queries'

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

        <p className="mt-8 text-lg text-slate-300">
          Hi! <Emoji emoji="👋" label="Hi!" />
        </p>
        <p className="mt-2 text-lg text-slate-300">
          My name is Christian and I&apos;m a freelance web developer. I have experience from large, agile projects
          dealing with complex code bases, as well as working in small startup teams. I&apos;m experienced in most
          aspects of developing web based applications ranging from frontend to backend, though my specialty and passion
          lies within the frontend layer with JavaScript technologies such as HTML, CSS, React, animations and UI
          development.
        </p>

        <hr />

        <h2 className="mb-8 flex justify-center gap-3 text-center text-3xl text-slate-500">
          <Emoji emoji="👨‍💻" label="Guy behind his computer" />
          <span>Previous Work</span>
        </h2>
        <WorkItems items={workItems} />

        <hr />

        <h2 className="mb-8 flex justify-center gap-3 text-center text-3xl text-slate-500">
          <Emoji emoji="☎️" label="Telephone" />
          <span>Get in touch</span>
        </h2>
        <div className="flex flex-col items-center justify-center gap-2 xs:flex-row">
          <a
            href="mailto:christian@hiddenvillage.se"
            className="inline-flex justify-center gap-2 rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500"
          >
            <Icon name="atSymbol" className="w-5 text-slate-600" />
            christian@hiddenvillage.se
          </a>
          <a
            href="tel:+46739194613"
            className="inline-flex justify-center gap-2 rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500"
          >
            <Icon name="phone" className="w-5 text-slate-600" />
            +46 739 19 46 13
          </a>
        </div>
      </Container>
    </>
  )
}

export default IndexPage
