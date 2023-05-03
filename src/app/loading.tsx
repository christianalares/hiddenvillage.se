import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Introduction } from '@/components/Introduction'
import { WorkItems } from '@/components/WorkItems'

const WorkPageLoading = () => {
  return (
    <Container className="my-8 xs:my-16">
      <Header />

      <Introduction />

      <WorkItems skeleton />

      <hr />

      <Footer />
    </Container>
  )
}

export default WorkPageLoading
