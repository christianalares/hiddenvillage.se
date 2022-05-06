import Head from 'next/head'
import { useEffect } from 'react'
import s from './IndexPage.module.scss'

const IndexPage = () => {
  useEffect(() => {
    console.log('Ooh, hello there! 🤪')
  }, [])

  return (
    <>
      <Head>
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="588" />
        <meta property="og:title" content="Välfärd test title" />
        <meta property="og:description" content="Välfärd test description" />
        <meta
          property="og:image"
          content="https://www.svensktnaringsliv.se/valfardsskaparna-image/v1?type=polis&foretag=Kalle Anka AB&anstallda=9999&lonekostnader=9999&bolagsskatt=99999&valfardsavtryck=99999"
        />
      </Head>
      <div className={s.indexPage}>
        <h1>Hidden Village</h1>
        <a href="mailto:christian@hiddenvillage.se">christian@hiddenvillage.se</a>
      </div>
    </>
  )
}

export default IndexPage
