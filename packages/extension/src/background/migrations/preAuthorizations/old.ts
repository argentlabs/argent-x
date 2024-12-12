import { isArray, pick } from "lodash-es"
import browser from "webextension-polyfill"

import { withHiddenSelector } from "../../../shared/account/selectors"
import { accountService } from "../../../shared/account/service"
import { preAuthorizationStore } from "../../../shared/preAuthorization/store"
import type { PreAuthorization } from "../../../shared/preAuthorization/schema"

async function getFromStorage<T, K extends string = string>(
  key: K,
): Promise<T | null> {
  try {
    return JSON.parse((await browser.storage.local.get(key))[key]) ?? null
  } catch {
    return null
  }
}

export async function runPreAuthorizationMigrationOld() {
  try {
    const old = await getFromStorage<string[]>("PREAUTHORIZATION:APPROVED")
    if (isArray(old) && old.length > 0) {
      await browser.storage.local.remove("PREAUTHORIZATION:APPROVED")
      const allAccounts = await accountService.get(withHiddenSelector)

      const accountHostCombinations: PreAuthorization[] = old.flatMap((h) =>
        allAccounts.map((a) => ({
          account: pick(a, "id", "address", "networkId"),
          host: h,
        })),
      )

      return preAuthorizationStore.push(accountHostCombinations)
    }
  } catch {
    console.error("Failed to migrate preauthorizations")
  }
}
