import { SelectOption } from "@argent/ui"
import { useMemo } from "react"

import { accountStore } from "../../../../shared/account/store"
import { Network } from "../../../../shared/network/type"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import { WalletAccount } from "../../../../shared/wallet.model"
import type { Account } from "../../accounts/Account"
import { AccountAvatar } from "../../accounts/AccountListItem"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"
import { useNetworks } from "../../networks/useNetworks"
import { SelectOptionAccount } from "./SelectOptionAccount"

const useFormSelects = (selectedNetwork: string) => {
  const networks = useNetworks()
  const accounts = useArrayStorage(accountStore)

  const networkOptions = useMemo(
    () =>
      networks.map((network: Network) => ({
        label: <SelectOption label={network.name} />,
        labelSelected: network.name,
        value: network.id,
      })),
    [networks],
  )

  const accountOptions = useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.networkId === selectedNetwork &&
            !account.hidden &&
            !Boolean(account?.guardian).valueOf(),
        )
        .map((account: WalletAccount) => ({
          icon: (
            <AccountAvatar
              src={getNetworkAccountImageUrl({
                accountName: account.name,
                accountAddress: account.address,
                networkId: account.networkId,
                backgroundColor: undefined,
              })}
            />
          ),
          label: <SelectOptionAccount account={account as Account} />,
          labelSelected: account.name,
          value: account.address,
        })),
    [accounts, selectedNetwork],
  )

  return {
    accounts,
    accountOptions,
    networkOptions,
  }
}

export { useFormSelects }
