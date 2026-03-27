import { JSearchJob } from '@/types'

const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search'

export async function searchJobs(query: string, location?: string): Promise<JSearchJob[]> {
  const fullQuery = location ? `${query} internship ${location}` : `${query} internship`

  const params = new URLSearchParams({
    query: fullQuery,
    page: '1',
    num_pages: '1',
    date_posted: 'month',
  })

  const response = await fetch(`${JSEARCH_URL}?${params}`, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`JSearch API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return (data.data ?? []) as JSearchJob[]
}
