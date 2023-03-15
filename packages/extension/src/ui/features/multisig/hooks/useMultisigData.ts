import useSWR from "swr"

import { getMultisigAccountData } from "../../../../shared/multisig/multisig.service"
import { Account } from "../../accounts/Account"
import { useCurrentNetwork } from "../../networks/useNetworks"

export const useMultisigData = (account?: Account) => {
  const currentNetwork = useCurrentNetwork()
  const { data, error } = useSWR(
    [account?.address, "multisigData"],
    () => {
      if (account?.type === "multisig") {
        return getMultisigAccountData({
          address: account.address,
          networkId: currentNetwork.id,
        })
      }
    },
    {
      suspense: false,
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return {
    creator: data?.content.creator,
    signers: data?.content.signers,
    threshold: data?.content.threshold,
    error,
  }
}
