import { formatDate } from "../../utils/dates"
import { fetchVoyagerTransactions } from "../../utils/voyager.service"
import { DailyActivity } from "./accountActivity.model"

export const fetchActivity = async (address: string, networkId: string) => {
  const voyagerTransactions = await fetchVoyagerTransactions(address, networkId)
  const activity: DailyActivity = {}
  for (const { hash, to, timestamp } of voyagerTransactions) {
    const date = new Date(timestamp * 1000)
    const dateLabel = formatDate(date)
    activity[dateLabel] ||= []
    activity[dateLabel].push({ hash, to, date })
  }
  return activity
}
