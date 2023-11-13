export type INFTWorkerStore = Record<
  string,
  {
    isUpdating: boolean
    lastUpdatedTimestamp: number
  }
>
