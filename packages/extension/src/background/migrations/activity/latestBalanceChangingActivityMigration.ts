import browser from "webextension-polyfill"

/** migrate the original activity storage which was coupled only to balance change activity */

export async function runLatestBalanceChangingActivityMigration() {
  await browser.storage.local.remove(
    "service:activity:latestBalanceChangingActivity",
  )
}
