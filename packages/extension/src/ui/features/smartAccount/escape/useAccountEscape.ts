import { useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import { useCurrentNetwork } from "./../../networks/hooks/useCurrentNetwork"

import type { Escape } from "../../../../shared/account/details/escape.model"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { useArrayStorage } from "../../../hooks/useStorage"
import { routes } from "../../../../shared/ui/routes"
import { clientAccountService } from "../../../services/account"
import { withPolling } from "../../../services/swr.service"
import { allAccountsWithEscapeOnNetworkFamily } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useAccountTransactions } from "../../accounts/accountTransactions.state"
import {
  escapeWarningStore,
  getEscapeWarningStoreKey,
} from "./escapeWarningStore"
import { getActiveFromNow } from "../../../../shared/utils/getActiveFromNow"

export type LiveAccountEscapeProps = Escape &
  ReturnType<typeof getActiveFromNow>

/** returns escape attributes including live countdown */

export const useLiveAccountEscape = (account?: WalletAccount) => {
  const { data: liveAccountEscape } = useSWR<
    LiveAccountEscapeProps | undefined
  >(
    account ? [account.id, "accountEscape"] : null,
    async () => {
      if (!account?.escape) {
        return
      }
      const { activeAt, type } = account.escape
      const activeFromNow = getActiveFromNow(activeAt)
      return {
        activeAt,
        type,
        ...activeFromNow,
      }
    },
    {
      ...withPolling(1000) /** 1 second - purely cosmetic */,
    },
  )
  return liveAccountEscape
}

// need to be global because the react state does not update fast enough in the useAccountEscapeWarning hook, and the warning is shown twice
let hasDisplayedWarning = false
/** checks and shows a warning if an account has an escape state that has not yet shown to the user */

export const useAccountEscapeWarning = () => {
  const navigate = useNavigate()
  const currentNetwork = useCurrentNetwork()
  const accountsWithEscape = useView(
    allAccountsWithEscapeOnNetworkFamily(currentNetwork.id),
  )

  const escapeWarningKeys = useArrayStorage(escapeWarningStore)

  const accountWithNewEscape = useMemo(() => {
    return accountsWithEscape.find(
      (account) =>
        !escapeWarningKeys.includes(getEscapeWarningStoreKey(account)),
    )
  }, [escapeWarningKeys, accountsWithEscape])

  const maybeShowWarning = useCallback(async () => {
    if (accountWithNewEscape && !hasDisplayedWarning) {
      hasDisplayedWarning = true
      await clientAccountService.select(accountWithNewEscape.id)
      navigate(routes.smartAccountEscapeWarning(accountWithNewEscape.id))
    }
  }, [accountWithNewEscape, navigate])

  useEffect(() => {
    //for some reason the component containing this hook is rendered twice, so we need to wait a bit, otherwise the maybeShowWarning will set the hasDisplayedWarning to true on the first render and the warning will not be shown
    setTimeout(() => {
      void maybeShowWarning()
    }, 50)
  }, [maybeShowWarning])
}

export const hideEscapeWarning = async (account: WalletAccount) => {
  /** handles duplicates */
  await escapeWarningStore.push(getEscapeWarningStoreKey(account))
}

/**
 * Hook to check if there is a pending 'cancelEscape' transaction for the provided account
 * @param account - the account to check
 * @returns boolean status if there is a pending transaction
 */

export const useAccountHasPendingCancelEscape = (
  account?: BaseWalletAccount,
) => {
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingCancelEscape = useMemo(() => {
    const cancelEscapeTransaction = pendingTransactions.find(
      (transaction) => transaction.meta?.isCancelEscape,
    )
    return Boolean(cancelEscapeTransaction)
  }, [pendingTransactions])

  return pendingCancelEscape
}
