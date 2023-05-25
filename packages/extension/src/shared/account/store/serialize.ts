import { getNetwork } from "../../network"
import { StoredWalletAccount, WalletAccount } from "../../wallet.model"

export function serialize(accounts: WalletAccount[]): StoredWalletAccount[] {
  return accounts.map((account) => {
    const { network, ...accountWithoutNetwork } = account
    return accountWithoutNetwork
  })
}

export async function deserialize(
  accounts: StoredWalletAccount[],
): Promise<WalletAccount[]> {
  return Promise.all(
    accounts.map(async (account) => {
      const network = await getNetwork(account.networkId)
      return {
        ...account,
        network,
      }
    }),
  )
}
