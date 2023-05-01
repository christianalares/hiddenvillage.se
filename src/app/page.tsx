import { Client } from '@notionhq/client'
import Head from 'next/head'
import Image from 'next/image'
import Container from '../components/Container'
import CurrentWorkItemModal from '../components/CurrentWorkItemModal'
import Emoji from '../components/Emoji'
import WorkItems from '../components/WorkItems'
import getEntriesFromDb from '../utils/notion/getEntriesFromDb'
import { Icon } from '../components/Icon'

export const metadata = {
  title: 'Hidden Village2',
}

export const revalidate = 10

const IndexPage = async () => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  const db = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as string,
  })

  const publishedDb = {
    ...db,
    // @ts-ignore
    results: db.results.filter(item => item.properties.Status.status.name === 'Published'),
  }

  const workItems = await getEntriesFromDb(publishedDb, notion)

  return (
    <>
      {/* <Head>
        <title>Hidden Village</title>
        <meta name="description" content="Hidden Village is a personal website of Christian Alares" />
        <meta property="og:title" content="Hidden Village" />
        <meta property="og:image" content="/me.jpg" />
        <meta property="og:description" content="Hidden Village is a personal website of Christian Alares" />
        <link rel="icon" type="image/jpg" sizes="32x32" href="/favicon/me-32x32.jpg" />
        <link rel="icon" type="image/jpg" sizes="16x16" href="/favicon/me-16x16.jpg" />
      </Head> */}

      <CurrentWorkItemModal items={workItems} />

      <Container className="my-8 xs:my-16">
        <div className="flex justify-center">
          <div className="relative">
            <Emoji
              emoji="👋"
              label="Hello"
              className="absolute -bottom-2 -left-4 inline-block animate-wiggle text-6xl"
            />
            <Image priority src="/me.jpg" alt="Me" width={160} height={160} className="rounded-full shadow-2xl" />
          </div>
        </div>

        <h1 className="mt-16 text-center">
          <span className="block text-4xl xs:text-5xl sm:text-6xl">Hidden Village</span>
          <span className="mt-4 block text-3xl text-slate-500 xs:mt-6 xs:text-4xl">Christian Alares</span>
        </h1>

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
            {/* <AtSymbolIcon className="w-5 text-slate-600" /> */}
            <Icon name="atSymbol" className="w-5 text-slate-600" />
            christian@hiddenvillage.se
          </a>
          <a
            href="tel:+46739194613"
            className="inline-flex justify-center gap-2 rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500"
          >
            {/* <PhoneIcon className="w-5 text-slate-600" /> */}
            <Icon name="phone" className="w-5 text-slate-600" />
            +46 739 19 46 13
          </a>
        </div>
      </Container>
    </>
  )
}

export default IndexPage
