import useSWR from "swr"

import { BaseMultisigWalletAccount } from "../../../../shared/wallet.model"
import { getMultisigAccount } from "../../../services/backgroundAccounts"
import { Account } from "../../accounts/Account"
import { useCurrentNetwork } from "../../networks/useNetworks"

export const useMultisigData = (account?: Account) => {
  const currentNetwork = useCurrentNetwork()
  const { data, error } = useSWR<BaseMultisigWalletAccount | undefined>(
    [account?.address, "multisigData"],
    () => {
      if (account?.type === "multisig") {
        return getMultisigAccount(account.address, currentNetwork.id)
      }
    },
    {
      suspense: false,
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return {
    creator: data?.creator,
    signers: data?.signers,
    threshold: data?.threshold,
    error,
  }
}
