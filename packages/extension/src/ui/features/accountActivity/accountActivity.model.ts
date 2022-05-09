export interface ActivityTransaction {
  hash: string
  to: string
  date: Date
}

export type DailyActivity = Record<string, ActivityTransaction[]>
