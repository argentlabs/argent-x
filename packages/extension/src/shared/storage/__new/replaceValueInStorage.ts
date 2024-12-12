import browser from "webextension-polyfill"
import { browserExtensionSentryWithScope } from "../../sentry/scope"
import { replaceValueRecursively } from "./utils"

type StorageData = { [key: string]: any }

/** Function to replace a value with a new value across all records in storage
 *  Optionally, the replacement can be limited to specific keys
 *  !! Should be used with caution as it modifies the storage data directly
 */
export async function replaceValueInStorage(
  oldValue: any,
  newValue: any,
  keys?: string[],
): Promise<void> {
  let originalStorageData: StorageData | null = null
  let isSaving = false
  try {
    // Get all data from storage
    originalStorageData = await browser.storage.local.get()

    // Clone the original storage data to avoid modifying it directly
    const storageData: StorageData = JSON.parse(
      JSON.stringify(originalStorageData),
    )
    // Recursively replace the value in the entire storage data
    replaceValueRecursively(storageData, oldValue, newValue, keys)

    isSaving = true
    // Save the modified data back to storage
    await browser.storage.local.set(storageData)
    isSaving = false
  } catch (error) {
    browserExtensionSentryWithScope((scope) => {
      scope.setLevel("warning")
      scope.setExtra("replacedAccountId", { oldValue, newValue })
      scope.captureException(
        new Error(
          `Error replacing value in storage. Restoring to original. ${error}`,
        ),
      )
    })
    console.error("Error replacing value in storage:", error)

    // Restore the original storage data in case of an error when saving
    if (originalStorageData && isSaving) {
      try {
        await browser.storage.local.set(originalStorageData)
      } catch (restoreError) {
        browserExtensionSentryWithScope((scope) => {
          scope.setLevel("error")
          scope.setExtra("replacedAccountId", { oldValue, newValue })
          scope.captureException(
            new Error(
              `Error restoring the original storage data: ${restoreError}`,
            ),
          )
        })
      }
    }
  }
}
