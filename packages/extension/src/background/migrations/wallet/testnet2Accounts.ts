import type {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import {
  defaultNetworkOnlyPlaceholderAccount,
  type WalletAccount,
} from "../../../shared/wallet.model"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"

export async function getTestnet2Accounts(
  walletStore: IRepository<WalletAccount>,
): Promise<WalletAccount[]> {
  const accounts = await walletStore.get()

  return accounts.filter((account) => account.networkId === "goerli-alpha-2")
}

export async function migrateTestnet2Accounts(
  walletStore: IRepository<WalletAccount>,
  store: IObjectStore<WalletStorageProps>,
) {
  const testnet2Accounts = await getTestnet2Accounts(walletStore)
  // update accounts to hide the testnet2 ones
  await walletStore.remove(testnet2Accounts)

  // if selected account is in list of testnet2 accounts, select another one
  const { selected } = await store.get()
  if (selected?.networkId === "goerli-alpha-2") {
    const [firstValidAccount] = await walletStore.get(
      (account) => !account.hidden && account.networkId !== "goerli-alpha-2",
    )
    await store.set({
      selected: firstValidAccount
        ? {
            id: firstValidAccount.id,
            address: firstValidAccount.address,
            networkId: firstValidAccount.networkId,
          }
        : defaultNetworkOnlyPlaceholderAccount,
    })
  }
}
