export interface IActivity {
  id: string
  lastModified: number
}
export interface IActivityStorage {
  latestBalanceChangingActivity: {
    [address: string]: IActivity
  } | null
}
