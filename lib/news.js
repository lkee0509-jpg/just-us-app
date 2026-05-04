// Fetches top world headlines from GNews (free tier: 100 req/day)
export async function getTopHeadlines(count = 3) {
  const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=${count + 2}&apikey=${process.env.GNEWS_API_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`News API error: ${res.status}`)
  const data = await res.json()

  return data.articles.slice(0, count).map((article, i) =>
    `${i + 1}. ${article.title}`
  )
}
