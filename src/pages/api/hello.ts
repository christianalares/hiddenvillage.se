// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import type { NextApiRequest, NextApiResponse } from 'next'

// type Data = {
//   name: string
// }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /*   const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  const db = await notion.databases.query({
    database_id: 'b06de58d94f8464bbf4d3cfe3ec17c48',
  })

  const data = db.results.map(result => ({
    id: result.id,
    title: result.properties.Name.title[0].plain_text,
    skills: result.properties.Skills.multi_select.map(skill => skill.name),
    date: {
      from: result.properties.Date.date.start,
      to: result.properties.Date.date.end,
    },
    role: result.properties.Role.rich_text[0].plain_text,
    url: result.properties.url,
  }))

  res.status(200).json({ db, data }) */

  const api = new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER_ID,
    authToken: process.env.NOTION_TOKEN_V2,
  })

  const db = await api.getPage('b06de58d94f8464bbf4d3cfe3ec17c48')
  // const collectionId = 'b06de58d-94f8-464b-bf4d-3cfe3ec17c48'
  const collectionId = '88d6fdf1-7ec0-4a25-bd8f-c1c7ecbda94e'
  const collectionViewId = '3d943958-5828-45f1-b0b4-55c1837a643f'
  const table = await api.getCollectionData(collectionId, collectionViewId, db.collection_view)
  const tableArr = table.result.reducerResults.collection_group_results.blockIds.map(
    (id: string) => table.recordMap.block[id]
  )

  console.log(tableArr)

  // const db2 = await api.getCollectionData(collectionId, collectionViewId, null)
  res.status(200).json({ table })
}

export default handler
