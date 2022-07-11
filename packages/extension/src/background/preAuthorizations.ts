import {
  AccountsByHost,
  IHostAndAccount,
  IPreAuthorizations,
} from "../shared/preAuthorizations"
import { getFromStorage, setToStorage } from "./storage"

/** original implementation pre-authorized all acounts */
/** TODO: remove at some point in future */
export const PREAUTHORIZED_ALL_ACCOUNTS = `PREAUTHORIZATION:APPROVED`

/** pre-authorized accounts mapped by host */
export const PREAUTHORIZED_ACCOUNTS_BY_HOST = `PREAUTHORIZED:ACCOUNTS_BY_HOST`

/**
 * @deprecated Use preAuthorize by account address
 */
export async function preAuthorizeAllAccounts(host: string) {
  const approved = await getFromStorage<string[]>(PREAUTHORIZED_ALL_ACCOUNTS)
  await setToStorage(PREAUTHORIZED_ALL_ACCOUNTS, [...(approved || []), host])
  await removePreAuthorization({
    host,
    accountAddress: null,
    skipAllAccountsCheck: true,
  })
}

/**
 * @deprecated Use getPreAuthorizations
 */
export async function getPreAuthorizationsAllAccounts() {
  const approved = await getFromStorage<string[]>(PREAUTHORIZED_ALL_ACCOUNTS)
  return approved || []
}

/**
 * @deprecated Use removePreAuthorization by account address
 */
export async function removePreAuthorizationAllAccounts(host: string) {
  const approved = await getFromStorage<string[]>(PREAUTHORIZED_ALL_ACCOUNTS)
  await setToStorage(
    PREAUTHORIZED_ALL_ACCOUNTS,
    (approved || []).filter((x) => x !== host),
  )
  await removePreAuthorization({
    host,
    accountAddress: null,
    skipAllAccountsCheck: true,
  })
}

/**
 * @deprecated Use isPreAuthorized by account address
 */
export async function isPreAuthorizedAllAccounts(host: string) {
  const approved = await getFromStorage<string[]>(PREAUTHORIZED_ALL_ACCOUNTS)
  return (approved || []).includes(host)
}

export const getAccountsByHost = async (): Promise<AccountsByHost> => {
  const accountsByHost = await getFromStorage<AccountsByHost>(
    PREAUTHORIZED_ACCOUNTS_BY_HOST,
  )
  return accountsByHost || {}
}

export const setAccountsByHost = async (accountsByHost: AccountsByHost) => {
  await setToStorage(PREAUTHORIZED_ACCOUNTS_BY_HOST, accountsByHost)
}

export const preAuthorize = async ({
  host,
  accountAddress,
}: IHostAndAccount) => {
  if (!accountAddress) {
    return
  }
  // remove 'all accounts' authorization
  if (await isPreAuthorizedAllAccounts(host)) {
    await removePreAuthorizationAllAccounts(host)
  }
  const accountsByHost = await getAccountsByHost()
  if (!accountsByHost[host]) {
    accountsByHost[host] = []
  }
  if (!accountsByHost[host].includes(accountAddress)) {
    accountsByHost[host].push(accountAddress)
  }
  await setAccountsByHost(accountsByHost)
}

export const removePreAuthorization = async ({
  host,
  /** pass null to remove all accounts */
  accountAddress,
  /** internal flag to check all accounts without causing circular callback */
  skipAllAccountsCheck,
}: IHostAndAccount & {
  skipAllAccountsCheck?: boolean
}) => {
  if (!skipAllAccountsCheck) {
    // remove 'all accounts' authorization
    if (await isPreAuthorizedAllAccounts(host)) {
      await removePreAuthorizationAllAccounts(host)
    }
  }
  const accountsByHost = await getAccountsByHost()
  if (!accountsByHost[host]) {
    return
  }
  if (accountAddress === null) {
    delete accountsByHost[host]
  } else {
    accountsByHost[host] = accountsByHost[host].filter(
      (hostAccount) => hostAccount !== accountAddress,
    )
    // remove when empty
    if (!accountsByHost[host].length) {
      delete accountsByHost[host]
    }
  }
  await setAccountsByHost(accountsByHost)
}

export const getPreAuthorizations = async (): Promise<IPreAuthorizations> => {
  const allAccounts = await getPreAuthorizationsAllAccounts()
  const accountsByHost = await getAccountsByHost()
  return {
    allAccounts,
    accountsByHost,
  }
}

export const isPreAuthorized = async ({
  host,
  accountAddress,
}: IHostAndAccount) => {
  if (!accountAddress) {
    return isPreAuthorizedAllAccounts(host)
  }
  const accountsByHost = await getAccountsByHost()
  const isPreAuthorized =
    accountsByHost[host] && accountsByHost[host].includes(accountAddress)
  return isPreAuthorized || isPreAuthorizedAllAccounts(host)
}

export async function resetPreAuthorizations() {
  await setToStorage(PREAUTHORIZED_ALL_ACCOUNTS, [])
  await setAccountsByHost({})
}
