import { NewsApiReponse } from "./schema"

export type IDiscoverStorage = {
  data: NewsApiReponse | null
  viewedAt: number
}
