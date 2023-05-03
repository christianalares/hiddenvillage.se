import { Emoji } from './Emoji'

export const Introduction = () => {
  return (
    <div>
      <p className="mt-8 text-lg text-slate-300">
        Hi! <Emoji emoji="👋" label="Hi!" />
      </p>
      <p className="mt-2 text-lg text-slate-300">
        My name is Christian and I&apos;m a freelance web developer. I have experience from large, agile projects
        dealing with complex code bases, as well as working in small startup teams. I&apos;m experienced in most aspects
        of developing web based applications ranging from frontend to backend, though my specialty and passion lies
        within the frontend layer with JavaScript technologies such as HTML, CSS, React, animations and UI development.
      </p>

      <hr />

      <h2 className="mb-8 flex justify-center gap-3 text-center text-3xl text-slate-500">
        <Emoji emoji="👨‍💻" label="Guy behind his computer" />
        <span>Previous Work</span>
      </h2>
    </div>
  )
}
