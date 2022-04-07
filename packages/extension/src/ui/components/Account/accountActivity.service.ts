import { fetchVoyagerTransactions } from "../../utils/voyager.service"
import { DailyActivity } from "./accountActivity.model"

export const fetchActivity = async (address: string, networkId: string) => {
  const voyagerTransactions = await fetchVoyagerTransactions(address, networkId)
  const activity: DailyActivity = {}
  for (const { hash, to, timestamp } of voyagerTransactions) {
    const date = new Date(timestamp * 1000)
    const dateString = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    activity[dateString] ||= []
    activity[dateString].push({ hash, to, date })
  }
  for (const [key, values] of Object.entries(activity)) {
    console.warn("activity on", key, "is", values)
  }
  return activity
}
