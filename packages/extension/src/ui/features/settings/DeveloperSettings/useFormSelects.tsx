import { SelectOption } from "@argent/ui"
import { useMemo } from "react"

import { accountStore } from "../../../../shared/account/store"
import { Network } from "../../../../shared/network/type"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import { WalletAccount } from "../../../../shared/wallet.model"
import type { Account } from "../../accounts/Account"
import { AccountAvatar } from "../../accounts/AccountListItem"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"
import { useNetworks } from "../../networks/useNetworks"
import { SelectOptionAccount } from "./SelectOptionAccount"

const useFormSelects = (selectedNetwork: string) => {
  const networks = useNetworks()
  const accounts = useArrayStorage(accountStore)
  const { accountNames } = useAccountMetadata()

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
        .filter((account) => account.networkId === selectedNetwork)
        .map((account: WalletAccount) => ({
          icon: (
            <AccountAvatar
              src={getNetworkAccountImageUrl({
                accountName: getAccountName(account as Account, accountNames),
                accountAddress: account.address,
                networkId: account.networkId,
                backgroundColor: undefined,
              })}
            />
          ),
          label: <SelectOptionAccount account={account as Account} />,
          labelSelected: getAccountName(account as Account, accountNames),
          value: account.address,
        })),
    [accounts, accountNames, selectedNetwork],
  )

  return {
    accounts,
    accountOptions,
    networkOptions,
  }
}

export { useFormSelects }
