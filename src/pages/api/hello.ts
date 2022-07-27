// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'
import { Client } from '@notionhq/client'
import type { NextApiRequest, NextApiResponse } from 'next'

type Entry = {
  id: string
  title: string
  skills: string[]
  date: {
    from: string
    to: string
  }
  role: string
  url: string
  paragraphs: string[]
}

const getEntriesFromDb = async (db: QueryDatabaseResponse, notionClient: Client): Promise<Entry[]> => {
  const entries: Entry[] = []

  for (const entry of db.results) {
    const entryBlock = await notionClient.blocks.children.list({ block_id: entry.id })

    entries.push({
      id: entry.id,
      title: entry.properties.Name.title[0].plain_text,
      skills: entry.properties.Skills.multi_select.map(skill => {
        console.log(skill)
        return skill.name
      }),
      date: {
        from: entry.properties.Date.date.start,
        to: entry.properties.Date.date.end,
      },
      role: entry.properties.Role.rich_text[0].plain_text,
      url: entry.properties.url,
      paragraphs: entryBlock.results.map(x => x.paragraph.rich_text[0]?.plain_text).filter(Boolean),
    })
  }

  return entries
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  const db = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as string,
  })

  const data = await getEntriesFromDb(db, notion)

  res.status(200).json(data)
}

export default handler
