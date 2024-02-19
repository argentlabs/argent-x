import { NewsApiReponse } from "./schema"

export interface IDiscoverService {
  setViewedAt(viewedAt: number): Promise<void>
}

export type IDiscoverStorage = {
  data: NewsApiReponse | null
  viewedAt: number
}
