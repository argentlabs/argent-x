/**
 * Checks if there is a pending 'DEPLOY_ACCOUNT' transaction for the provided multisig account
 * @param account - the account to check
 * @returns boolean
 */

import { useMemo } from "react"

import { useDeployAccountTransactions } from "../../accounts/accountTransactions.state"
import { Multisig } from "../Multisig"

export const useIsMultisigDeploying = (multisig?: Multisig) => {
  const { pendingTransactions } = useDeployAccountTransactions(multisig)
  return useMemo(() => {
    if (!multisig) {
      return false
    }

    return pendingTransactions.length > 0
  }, [multisig, pendingTransactions.length])
}
