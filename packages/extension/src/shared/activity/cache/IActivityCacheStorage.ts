import type { AnyActivity } from "@argent/x-shared/simulation"

export interface IActivityCacheItem {
  activities: Array<AnyActivity>
  updatedAt?: number
  pageState?: {
    page: number
    pageSize: number
    totalElements: number
    totalPages: number
  }
}

export interface IActivityCacheStorage {
  cache: Record<string, IActivityCacheItem>
}
