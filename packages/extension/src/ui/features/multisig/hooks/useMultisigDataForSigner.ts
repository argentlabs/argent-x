import { useCallback } from "react"

import { ARGENT_MULTISIG_ENABLED } from "../../../../shared/api/constants"
import { fetchMultisigDataForSigner } from "../../../../shared/multisig/multisig.service"
import {
  BaseWalletAccount,
  MultisigData,
} from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { usePublicKey } from "../../accounts/usePublicKey"
import {
  isZeroMultisigAccount,
  useMultisigWalletAccount,
} from "../multisig.state"

export function useMultisigDataForSigner(account: BaseWalletAccount) {
  const multisigAccount = useMultisigWalletAccount(account)
  const publicSigner = usePublicKey(account)

  const multisigDataForSignerFetcher = useCallback(async () => {
    if (!multisigAccount || !publicSigner) {
      return
    }

    const data = await fetchMultisigDataForSigner({
      signer: publicSigner,
      network: multisigAccount.network,
    })

    if (!data || !data.content || data.content.length === 0) {
      if (!isZeroMultisigAccount(multisigAccount)) {
        return {
          signers: multisigAccount.signers,
          threshold: multisigAccount.threshold,
          creator: multisigAccount.creator,
        }
      }
      return
    }

    return {
      signers: data.content[0].signers,
      threshold: data.content[0].threshold,
      multisigAddress: data.content[0].address,
      creator: data.content[0].creator,
    }
  }, [multisigAccount, publicSigner])

  return useConditionallyEnabledSWR<MultisigData | undefined>(
    Boolean(ARGENT_MULTISIG_ENABLED),
    [
      "multisigDataForSigner",
      multisigAccount && getAccountIdentifier(multisigAccount),
      publicSigner,
    ],
    multisigDataForSignerFetcher,
    {
      refreshInterval: (latest) => (!latest ? 10e3 : 30e3), // if no data, refresh every 10s, otherwise every 30s
    },
  )
}
