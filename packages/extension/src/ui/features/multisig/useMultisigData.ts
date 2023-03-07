import useSWR from "swr"

import { getMultisigAccount } from "../../../services/backgroundAccounts"
import { useCurrentNetwork } from "../../networks/useNetworks"
import { Account } from "../Account"
import { MultisigAccount } from "./types"

export const useMultisigData = (account?: Account) => {
  const currentNetwork = useCurrentNetwork()
  const { data, error } = useSWR<MultisigAccount | undefined>(
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
    creator: data?.content.creator,
    signers: data?.content.signers,
    threshold: data?.content.threshold,
    error,
  }
}
