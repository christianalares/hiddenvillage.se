import clsx from 'clsx'
import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}
export default function RootLayout(props: Props) {
  return (
    <html lang="en">
      <body className={clsx(inter.className)}>
        <main>{props.children}</main>
        {props.modal}
      </body>
      <Analytics />
    </html>
  )
}
