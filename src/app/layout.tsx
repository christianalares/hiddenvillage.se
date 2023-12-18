import { Container } from '@/components/Container'
import { Header } from '@/components/Header'
import { cn } from '@/utils/cn'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Game } from '@/components/Game'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}
export default function RootLayout(props: Props) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <div>
          <Container>
            <Header />
          </Container>
          <main className="pb-8 xs:pb-16">{props.children}</main>
          {props.modal}
        </div>

        <Game />
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  )
}
