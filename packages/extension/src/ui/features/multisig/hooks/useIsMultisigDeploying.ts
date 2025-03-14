/**
 * Checks if there is a pending 'DEPLOY_ACCOUNT' transaction for the provided multisig account
 * @param account - the account to check
 * @returns boolean
 */

import { useMemo } from "react"

import { useDeployAccountTransactions } from "../../accounts/accountTransactions.state"
import type { MultisigWalletAccount } from "../../../../shared/wallet.model"

export const useIsMultisigDeploying = (multisig?: MultisigWalletAccount) => {
  const { pendingTransactions } = useDeployAccountTransactions(multisig)
  return useMemo(() => {
    if (!multisig) {
      return false
    }

    return pendingTransactions.length > 0
  }, [multisig, pendingTransactions.length])
}
