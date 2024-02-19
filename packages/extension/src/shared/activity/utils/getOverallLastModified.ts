import { Activity } from "../schema"

/**
 * Retrieves the overall last modified date across all provided activities.
 *
 * @param activities: Array of activities
 * @returns The overall last modified date, representing the latest modification among all activities.
 */
export function getOverallLastModified(activities: Activity[]) {
  const all = activities.map((activity) => activity.lastModified)
  const overallLastModified = all.sort().pop()
  return overallLastModified
}
