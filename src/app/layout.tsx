import { Container } from '@/components/Container'
import { Header } from '@/components/Header'
import { cn } from '@/utils/cn'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}
export default function RootLayout(props: Props) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <Container>
          <Header />
        </Container>

        <main className="pb-8 xs:pb-16">{props.children}</main>
        {props.modal}
      </body>
      <Analytics />
    </html>
  )
}
