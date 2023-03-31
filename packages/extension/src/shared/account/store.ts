import { ArrayStorage } from "../storage"
import { AllowArray, SelectorFn } from "../storage/types"
import { BaseWalletAccount, WalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { getAccountSelector, withoutHiddenSelector } from "./selectors"
import { deserialize, serialize } from "./serialize"

export const accountStore = new ArrayStorage<WalletAccount>([], {
  namespace: "core:accounts",
  compare: accountsEqual,
  serialize,
  deserialize,
})

export async function getAccounts(
  selector: SelectorFn<WalletAccount> = withoutHiddenSelector,
): Promise<WalletAccount[]> {
  return accountStore.get(selector)
}

export async function addAccounts(
  account: AllowArray<WalletAccount>,
): Promise<void> {
  await accountStore.push(account)
}

export async function removeAccount(
  baseAccount: BaseWalletAccount,
): Promise<void> {
  await accountStore.remove((account) => accountsEqual(account, baseAccount))
}

export async function hideAccount(
  baseAccount: BaseWalletAccount,
): Promise<void> {
  const [hit] = await getAccounts(getAccountSelector(baseAccount))
  if (!hit) {
    return
  }
  await accountStore.push({
    ...hit,
    hidden: true,
  })
}

export async function unhideAccount(
  baseAccount: BaseWalletAccount,
): Promise<void> {
  const [hit] = await getAccounts(getAccountSelector(baseAccount))
  if (!hit) {
    return
  }
  await accountStore.push({
    ...hit,
    hidden: false,
  })
}

export async function updateAccountName(
  account: BaseWalletAccount,
  name: string,
) {
  const [hit] = await getAccounts(getAccountSelector(account))
  if (!hit) {
    return
  }
  await accountStore.push({
    ...hit,
    name,
  })
}
