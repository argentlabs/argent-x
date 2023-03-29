import { useCallback } from "react"

import { ARGENT_MULTISIG_ENABLED } from "../../../../shared/api/constants"
import { fetchMultisigDataForSigner } from "../../../../shared/multisig/multisig.service"
import { BasePendingMultisig } from "../../../../shared/multisig/types"
import { BaseMultisigWalletAccount } from "../../../../shared/wallet.model"
import { getPendingMultisigIdentifier } from "../../../../shared/wallet.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { useNetwork } from "./../../networks/useNetworks"

export function useMultisigDataForSigner({
  publicKey,
  networkId,
}: BasePendingMultisig) {
  const network = useNetwork(networkId)

  const multisigDataForSignerFetcher = useCallback(async () => {
    const data = await fetchMultisigDataForSigner({
      signer: publicKey,
      network,
    })

    if (!data || !data.content || data.content.length === 0) {
      return
    }

    return {
      signers: data.content[0].signers,
      threshold: data.content[0].threshold,
      address: data.content[0].address,
      creator: data.content[0].creator,
      networkId: network.id,
    }
  }, [network, publicKey])

  return useConditionallyEnabledSWR<BaseMultisigWalletAccount | undefined>(
    Boolean(ARGENT_MULTISIG_ENABLED),
    [
      "multisigDataForSigner",
      publicKey && getPendingMultisigIdentifier({ publicKey, networkId }),
    ],
    multisigDataForSignerFetcher,
    {
      refreshInterval: (latest) => (!latest ? 10e3 : 30e3), // if no data, refresh every 10s, otherwise every 30s
    },
  )
}
