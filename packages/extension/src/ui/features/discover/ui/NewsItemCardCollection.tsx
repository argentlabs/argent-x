import { SimpleGrid } from "@chakra-ui/react"
import type { FC } from "react"
import { pluralise, daysBetween } from "@argent/x-shared"

import type { NewsItem } from "../../../../shared/discover/schema"
import { NewsItemCard } from "./NewsItemCard"

interface NewsItemCardCollectionProps {
  newsItems: NewsItem[]
}

export const NewsItemCardCollection: FC<NewsItemCardCollectionProps> = ({
  newsItems,
}) => {
  const now = new Date()
  return (
    <SimpleGrid minChildWidth={"300px"} spacing={2}>
      {newsItems.map((newsItem, index) => {
        const key = `${newsItem.dappId}-${index}`
        if (!newsItem.badgeText && newsItem.endTime) {
          const value = daysBetween(now, new Date(newsItem.endTime))
          const days = pluralise(value, "day")
          const badgeText = `${days} remaining`
          return (
            <NewsItemCard key={key} newsItem={{ ...newsItem, badgeText }} />
          )
        }
        return <NewsItemCard key={key} newsItem={newsItem} />
      })}
    </SimpleGrid>
  )
}
