import { useEffect } from 'react'
import s from './IndexPage.module.scss'

const IndexPage = () => {
  useEffect(() => {
    console.log('Ooh, hello there! 🤪')
  }, [])

  return (
    <div className={s.indexPage}>
      <h1>Hidden Village</h1>
      <a href="mailto:christian@hiddenvillage.se">christian@hiddenvillage.se</a>
    </div>
  )
}

export default IndexPage
