export type TWorkItem = {
  id: string
  slug: string
  title: string
  skills: string[]
  date: {
    from: string
    to: string | null
  }
  role: string
  url: string
  paragraphs: string[]
}
