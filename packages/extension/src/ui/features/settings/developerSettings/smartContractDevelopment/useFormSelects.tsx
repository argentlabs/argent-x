import { useMemo } from "react"

import { Network } from "../../../../../shared/network/type"
import { WalletAccount } from "../../../../../shared/wallet.model"
import { visibleAccountsView } from "../../../../views/account"
import { useView } from "../../../../views/implementation/react"
import type { Account } from "../../../accounts/Account"
import { AccountAvatar } from "../../../accounts/AccountAvatar"
import { getNetworkAccountImageUrl } from "../../../accounts/accounts.service"
import { useNetworks } from "../../../networks/hooks/useNetworks"
import { SelectOptionAccount } from "./SelectOptionAccount"

const useFormSelects = (selectedNetwork: string) => {
  const networks = useNetworks()
  const accounts = useView(visibleAccountsView)

  const networkOptions = useMemo(
    () =>
      networks.map((network: Network) => ({
        label: network.name,
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
