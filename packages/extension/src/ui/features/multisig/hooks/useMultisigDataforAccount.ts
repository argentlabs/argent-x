import { useCallback } from "react"

import { ARGENT_MULTISIG_ENABLED } from "../../../../shared/api/constants"
import { fetchMultisigDataForSigner } from "../../../../shared/multisig/multisig.service"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
} from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import {
  isZeroMultisigAccount,
  useMultisigWalletAccount,
} from "../multisig.state"

export function useMultisigDataForAccount(account: BaseWalletAccount) {
  const multisigAccount = useMultisigWalletAccount(account)

  const multisigDataForSignerFetcher = useCallback(async () => {
    if (!multisigAccount) {
      return
    }

    const data = await fetchMultisigDataForSigner({
      signer: multisigAccount.publicKey,
      network: multisigAccount.network,
    })

    if (!data || !data.content || data.content.length === 0) {
      if (!isZeroMultisigAccount(multisigAccount)) {
        return multisigAccount
      }
      return
    }

    return {
      signers: data.content[0].signers,
      threshold: data.content[0].threshold,
      address: data.content[0].address,
      creator: data.content[0].creator,
      networkId: account.networkId,
      publicKey: multisigAccount.publicKey,
    }
  }, [account.networkId, multisigAccount])

  return useConditionallyEnabledSWR<BaseMultisigWalletAccount | undefined>(
    Boolean(ARGENT_MULTISIG_ENABLED),
    [
      "multisigDataForSigner",
      multisigAccount && getAccountIdentifier(multisigAccount),
      multisigAccount?.publicKey,
    ],
    multisigDataForSignerFetcher,
    {
      refreshInterval: (latest) => (!latest ? 10e3 : 30e3), // if no data, refresh every 10s, otherwise every 30s
    },
  )
}