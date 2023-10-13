import { isArray, pick } from "lodash-es"
import browser from "webextension-polyfill"

import { withHiddenSelector } from "./account/selectors"
import { accountService } from "./account/service"
import { ArrayStorage } from "./storage"
import { useArrayStorage } from "./storage/hooks"
import { BaseWalletAccount } from "./wallet.model"
import { accountsEqual } from "./utils/accountsEqual"

interface PreAuthorization {
  account: BaseWalletAccount
  host: string
}
export const equalPreAuthorization = (
  a: PreAuthorization,
  b: PreAuthorization,
) => accountsEqual(a.account, b.account) && a.host === b.host

export const preAuthorizeStore = new ArrayStorage<PreAuthorization>([], {
  namespace: `core:whitelist`,
  compare: equalPreAuthorization,
})

async function getFromStorage<T, K extends string = string>(
  key: K,
): Promise<T | null> {
  try {
    return JSON.parse((await browser.storage.local.get(key))[key]) ?? null
  } catch {
    return null
  }
}
export const migratePreAuthorizations = async () => {
  try {
    const old = await getFromStorage<string[]>("PREAUTHORIZATION:APPROVED")
    if (isArray(old) && old.length > 0) {
      await browser.storage.local.remove("PREAUTHORIZATION:APPROVED")
      const allAccounts = await accountService.get(withHiddenSelector)

      const accountHostCombinations = old.flatMap((h) =>
        allAccounts.map((a) => ({
          account: pick(a, "address", "networkId"),
          host: h,
        })),
      )

      return preAuthorizeStore.push(accountHostCombinations)
    }
  } catch {
    console.error("Failed to migrate preauthorizations")
  }
}

export const preAuthorize = async (
  account: BaseWalletAccount,
  host: string,
) => {
  await preAuthorizeStore.push({
    account,
    host,
  })
}

export const removePreAuthorization = async (
  host: string,
  account?: BaseWalletAccount,
) => {
  await preAuthorizeStore.remove((x) => {
    if (account) {
      return equalPreAuthorization(x, { account, host })
    }
    return x.host === host
  })
}

export const getPreAuthorizations = () => {
  return preAuthorizeStore.get()
}

export const isPreAuthorized = async (
  account: BaseWalletAccount,
  host: string,
) => {
  const hits = await preAuthorizeStore.get((x) =>
    equalPreAuthorization(x, { account, host }),
  )
  return Boolean(hits.length)
}

export async function resetPreAuthorizations() {
  await preAuthorizeStore.remove(() => true)
}

// Hooks

export const usePreAuthorizations = () => useArrayStorage(preAuthorizeStore)
export const useIsPreauthorized = (
  host: string,
  account?: BaseWalletAccount,
) => {
  const all = useArrayStorage(preAuthorizeStore)
  return all.some((x) => account && equalPreAuthorization(x, { account, host }))
}
