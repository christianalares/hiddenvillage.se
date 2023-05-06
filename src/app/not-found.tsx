import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import Link from 'next/link'

const NotFound = () => {
  return (
    <Container>
      <p>Oops, that thing wasn&apos;t found.</p>

      <Link href="/" className="group mt-8 flex w-max items-center gap-2 transition-colors hover:text-slate-300">
        <Icon name="arrowLeft" className="h-6 transition-transform group-hover:-translate-x-1" />
        Go home
      </Link>
    </Container>
  )
}

export default NotFound
