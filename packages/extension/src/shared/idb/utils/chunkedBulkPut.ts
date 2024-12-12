import type { Table } from "dexie"

export async function chunkedBulkPut<T>(
  table: Table<T>,
  items: T[],
  chunkSize = 50,
) {
  await table.db.transaction("rw", table, async () => {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize)
      await table.bulkPut(chunk)
    }
  })
}
