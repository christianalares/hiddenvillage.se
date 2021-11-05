import type { NextPage } from 'next'
import Head from 'next/head'
import IndexPage from '../components/pages/IndexPage'

const Index: NextPage = () => {
  return (
    <>
      <Head>
        <title>Hidden Village</title>
      </Head>
      <IndexPage />
    </>
  )
}

export default Index
