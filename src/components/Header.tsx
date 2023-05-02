import { Emoji } from '@/components/Emoji'
import Image from 'next/image'

export const Header = () => {
  return (
    <div>
      <div className="flex justify-center">
        <div className="relative">
          <Emoji emoji="👋" label="Hello" className="absolute -bottom-2 -left-4 inline-block animate-wiggle text-6xl" />
          <Image priority src="/me.jpg" alt="Me" width={160} height={160} className="rounded-full shadow-2xl" />
        </div>
      </div>

      <h1 className="mt-16 text-center">
        <span className="block text-4xl xs:text-5xl sm:text-6xl">Hidden Village</span>
        <span className="mt-4 block text-3xl text-slate-500 xs:mt-6 xs:text-4xl">Christian Alares</span>
      </h1>
    </div>
  )
}
