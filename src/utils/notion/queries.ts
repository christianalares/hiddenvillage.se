import { isFullPage } from '@notionhq/client'
import { notionClient } from './client'
import { TWorkItem } from './types'

export const getWorkItems = async () => {
  const fullOrPartialPages = await notionClient.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as string,
  })

  const results: TWorkItem[] = []

  for (const page of fullOrPartialPages.results) {
    if (!isFullPage(page)) {
      return results
    }

    // @ts-ignore
    const isPublished = page.properties.Status.status.name === 'Published'
    if (isPublished) {
      const entryBlock = await notionClient.blocks.children.list({ block_id: page.id })

      // @ts-ignore
      results.push({
        id: page.id,
        // @ts-ignore
        title: page.properties.Name.title[0].plain_text,
        // @ts-ignore
        skills: page.properties.Skills.multi_select.map(
          (skill: { id: string; name: string; color: string }) => skill.name
        ),
        date: {
          // @ts-ignore
          from: page.properties.Date.date.start,
          // @ts-ignore
          to: page.properties.Date.date.end,
        },
        // @ts-ignore
        role: page.properties.Role.rich_text[0].plain_text,
        // @ts-ignore
        url: page.properties.Link.url,
        // @ts-ignore
        paragraphs: entryBlock.results.map(result => result.paragraph.rich_text[0]?.plain_text).filter(Boolean),
      })
    }
  }

  return results
}

export const getWorkItem = async (id: string) => {
  const page = await notionClient.pages.retrieve({ page_id: id })

  if (!isFullPage(page)) {
    return {} as TWorkItem
  }

  const entryBlock = await notionClient.blocks.children.list({ block_id: page.id })

  const result = {
    id: page.id,
    // @ts-ignore
    title: page.properties.Name.title[0].plain_text,
    // @ts-ignore
    skills: page.properties.Skills.multi_select.map((skill: { id: string; name: string; color: string }) => skill.name),
    date: {
      // @ts-ignore
      from: page.properties.Date.date.start,
      // @ts-ignore
      to: page.properties.Date.date.end,
    },
    // @ts-ignore
    role: page.properties.Role.rich_text[0].plain_text,
    // @ts-ignore
    url: page.properties.Link.url,
    // @ts-ignore
    paragraphs: entryBlock.results.map(result => result.paragraph.rich_text[0]?.plain_text).filter(Boolean),
  }

  return result
}
