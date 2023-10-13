import type { Network } from "../../network"
import type { StoredWalletAccount, WalletAccount } from "../../wallet.model"

/**
 * @internal Should only be used in tests and serialization/deserialization.
 */
export function migrateAccount(account: WalletAccount): WalletAccount {
  const { type, ...rest } = account
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error This is a migration, so we can ignore the type error
  if (type === "argent") {
    return { ...rest, type: "standard" }
  }
  return account
}

export function serialize(accounts: WalletAccount[]): StoredWalletAccount[] {
  return accounts.map((account) => {
    const { network, ...accountWithoutNetwork } = migrateAccount(account)
    return accountWithoutNetwork
  })
}

type GetNetwork = (networkId: string) => Promise<Network>

export function deserializeFactory(getNetworkFn: GetNetwork) {
  return async (accounts: StoredWalletAccount[]): Promise<WalletAccount[]> => {
    const retrievedAccounts = await Promise.all(
      accounts
        .filter((account) => account.networkId !== "goerli-alpha-2")
        .map(async (account) => {
          const network = await getNetworkFn(account.networkId)
          return migrateAccount({
            ...account,
            network,
          })
        }),
    )

    return retrievedAccounts.filter((account): account is WalletAccount => {
      return !!account.network
    })
  }
}
