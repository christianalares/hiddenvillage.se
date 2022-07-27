import type { Client } from '@notionhq/client'
import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'

export type WorkItem = {
  id: string
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

const getEntriesFromDb = async (db: QueryDatabaseResponse, notionClient: Client): Promise<WorkItem[]> => {
  const entries: WorkItem[] = []

  for (const entry of db.results) {
    const entryBlock = await notionClient.blocks.children.list({ block_id: entry.id })

    entries.push({
      id: entry.id,
      // @ts-ignore
      title: entry.properties.Name.title[0].plain_text,
      // @ts-ignore
      skills: entry.properties.Skills.multi_select.map(
        (skill: { id: string; name: string; color: string }) => skill.name
      ),
      date: {
        // @ts-ignore
        from: entry.properties.Date.date.start,
        // @ts-ignore
        to: entry.properties.Date.date.end,
      },
      // @ts-ignore
      role: entry.properties.Role.rich_text[0].plain_text,
      // @ts-ignore
      url: entry.properties.Link.url,
      // @ts-ignore
      paragraphs: entryBlock.results.map(result => result.paragraph.rich_text[0]?.plain_text).filter(Boolean),
    })
  }

  return entries
}

export default getEntriesFromDb
