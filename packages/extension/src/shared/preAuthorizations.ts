import { ArrayStorage } from "./storage"
import { useArrayStorage } from "./storage/hooks"
import { BaseWalletAccount } from "./wallet.model"
import { accountsEqual } from "./wallet.service"

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
  const hit = await preAuthorizeStore.get((x) =>
    equalPreAuthorization(x, { account, host }),
  )
  return !!hit
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
