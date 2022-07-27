import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/outline'
import { Client } from '@notionhq/client'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect } from 'react'
import Container from '../components/Container'
import CurrentWorkItemModal from '../components/CurrentWorkItemModal'
import Emoji from '../components/Emoji'
import WorkItems from '../components/WorkItems'
import getEntriesFromDb, { WorkItem } from '../utils/notion/getEntriesFromDb'

type Props = {
  workItems: WorkItem[]
}

const Index: NextPage<Props> = ({ workItems }) => {
  useEffect(() => {
    console.log('Ooh, hello there! 🤪')
  }, [])

  return (
    <>
      <Head>
        <title>Hidden Village</title>
        <meta name="description" content="Hidden Village is a personal website of Christian Alares" />
        <meta property="og:title" content="Hidden Village" />
        <meta property="og:image" content="/me.jpg" />
        <meta property="og:description" content="Hidden Village is a personal website of Christian Alares" />
      </Head>

      <CurrentWorkItemModal items={workItems} />

      <Container className="my-8 xs:my-16">
        <div className="flex flex-col xs:flex-row items-center justify-center relative gap-8">
          <Emoji emoji="👋" label="Hello" className="inline-block animate-wiggle text-9xl" />
          <Image
            priority
            src="/me.jpg"
            alt="Me"
            width={160}
            height={160}
            layout="raw"
            className="rounded-full shadow-2xl"
          />
        </div>

        <h1 className="text-center mt-16">
          <span className="block text-4xl xs:text-5xl sm:text-6xl">Hidden Village</span>
          <span className="block text-3xl xs:text-4xl mt-4 xs:mt-6 text-slate-500">Christian Alares</span>
        </h1>

        <p className="mt-8 text-slate-300 text-lg">
          Hi! <Emoji emoji="👋" label="Hi!" />
        </p>
        <p className="text-slate-300 mt-2 text-lg">
          My name is Christian and I&apos;m a freelance web developer. I have experience from large, agile projects
          dealing with complex code bases, as well as working in small startup teams. I&apos;m experienced in most
          aspects of developing web based applications ranging from frontend to backend, though my specialty and passion
          lies within the frontend layer with JavaScript technologies such as HTML, CSS, React, animations and UI
          development.
        </p>

        <hr className="hr" />

        <h2 className="text-slate-500 text-3xl text-center mb-8 flex justify-center gap-3">
          <Emoji emoji="👨‍💻" label="Guy behind his computer" />
          <span>Previous Work</span>
        </h2>
        <WorkItems items={workItems} />

        <hr className="hr" />

        <h2 className="text-slate-500 text-3xl text-center mb-8 flex justify-center gap-3">
          <Emoji emoji="☎️" label="Telephone" />
          <span>Get in touch</span>
        </h2>
        <div className="flex flex-col items-center xs:flex-row gap-2 justify-center">
          <a
            href="mailto:christian@hiddenvillage.se"
            className="inline-flex justify-center gap-2 text-slate-400 hover:border-slate-500 transition-colors p-2 rounded-md border border-slate-700"
          >
            <AtSymbolIcon className="w-5 text-slate-600" />
            christian@hiddenvillage.se
          </a>
          <a
            href="tel:+46739194613"
            className="inline-flex justify-center gap-2 text-slate-400 hover:border-slate-500 transition-colors p-2 rounded-md border border-slate-700"
          >
            <PhoneIcon className="w-5 text-slate-600" />
            +46 739 19 46 13
          </a>
        </div>
      </Container>
    </>
  )
}

export const getStaticProps = async () => {
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

  const data = await getEntriesFromDb(publishedDb, notion)

  return {
    props: {
      workItems: data,
    },
    revalidate: 10,
  }
}




export default Index
