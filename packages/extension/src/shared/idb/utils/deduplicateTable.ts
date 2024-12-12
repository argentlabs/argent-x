import type Dexie from "dexie"
import { browserExtensionSentryWithScope } from "../../sentry/scope"
import { sanitizeRecord } from "../middleware/addressNormalizerMiddleware"

export const deduplicateTable = async <T>(
  table: Dexie.Table,
  getPrimaryKey: (item: T) => string,
) => {
  const allItems = await table.toArray()
  const uniqueItems = new Map()

  // Remove all duplicates and sanitize records
  allItems.forEach((item) => {
    const primaryKey = getPrimaryKey(item)
    const existingItem = uniqueItems.get(primaryKey)
    if (
      !existingItem ||
      (item.updatedAt && item.updatedAt > existingItem.updatedAt)
    ) {
      uniqueItems.set(primaryKey, sanitizeRecord(item))
    }
  })

  // Clear the table
  await table.clear()

  try {
    // Insert the sanitized records
    const sanitizedRecords = Array.from(uniqueItems.values())
    await table.bulkAdd(sanitizedRecords)
  } catch (error) {
    console.error(
      `Failed to bulk add sanitized items while deduplicating table: ${table.name}`,
      error,
    )
    browserExtensionSentryWithScope((scope) => {
      scope.setLevel("warning")
      scope.captureException(
        new Error(
          `Failed to bulk add sanitized items while deduplicating table: ${table.name}: ${error}`,
        ),
      )
    })
    try {
      await table.bulkAdd(allItems)
    } catch (error) {
      console.error(
        `Failed to restore exiting items in ${table.name} in deduplication process`,
        error,
      )
      browserExtensionSentryWithScope((scope) => {
        scope.setLevel("error")
        scope.captureException(
          new Error(
            `Failed to restore exiting items in ${table.name} in deduplication process: ${error}`,
          ),
        )
      })
    }
  }
}
