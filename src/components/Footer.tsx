import { Emoji } from './Emoji'
import { Icon } from './Icon'

export const Footer = () => {
  return (
    <footer>
      <h2 className="mb-8 flex justify-center gap-3 text-center text-3xl text-slate-500">
        <Emoji emoji="☎️" label="Telephone" />
        <span>Get in touch</span>
      </h2>
      <div className="flex flex-col items-center justify-center gap-2 xs:flex-row">
        <a
          href="mailto:christian@hiddenvillage.se"
          className="inline-flex justify-center gap-2 rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500"
        >
          <Icon name="atSymbol" className="w-5 text-slate-600" />
          christian@hiddenvillage.se
        </a>
        <a
          href="tel:+46739194613"
          className="inline-flex justify-center gap-2 rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500"
        >
          <Icon name="phone" className="w-5 text-slate-600" />
          +46 739 19 46 13
        </a>
      </div>
    </footer>
  )
}
