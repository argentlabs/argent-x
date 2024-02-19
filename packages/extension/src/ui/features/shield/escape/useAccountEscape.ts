import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { pluralise } from "@argent/shared"
import useSWR from "swr"

import { Escape } from "../../../../shared/account/details/escape.model"
import { useArrayStorage } from "../../../hooks/useStorage"
import { isNumeric } from "../../../../shared/utils/number"
import {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { routes } from "../../../routes"
import { withPolling } from "../../../services/swr.service"
import { allAccountsWithEscapeView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useAccountTransactions } from "../../accounts/accountTransactions.state"
import {
  escapeWarningStore,
  getEscapeWarningStoreKey,
} from "./escapeWarningStore"
import { clientAccountService } from "../../../services/account"

export const getActiveFromNow = (activeAt: number, now = new Date()) => {
  if (!isNumeric(activeAt)) {
    throw "activeAt should be numeric"
  }
  const activeFromNowMs = Math.max(0, activeAt * 1000 - now.getTime())
  /** 7 days max */
  const seconds = Math.floor((activeFromNowMs / 1000) % 60)
  const minutes = Math.floor((activeFromNowMs / (1000 * 60)) % 60)
  const hours = Math.floor((activeFromNowMs / (1000 * 60 * 60)) % 24)
  const days = Math.floor(activeFromNowMs / (1000 * 60 * 60 * 24))
  const daysCeil = Math.ceil(activeFromNowMs / (1000 * 60 * 60 * 24))
  const activeFromNowPretty =
    days > 0
      ? pluralise(daysCeil, "day")
      : hours > 0
      ? pluralise(hours, "hour")
      : minutes > 0
      ? pluralise(minutes, "minute")
      : seconds > 0
      ? pluralise(seconds, "second")
      : "now"
  return {
    activeFromNowMs,
    activeFromNowPretty,
  }
}

export type LiveAccountEscapeProps = Escape &
  ReturnType<typeof getActiveFromNow>

/** returns escape attributes including live countdown */

export const useLiveAccountEscape = (account?: WalletAccount) => {
  const { data: liveAccountEscape } = useSWR<
    LiveAccountEscapeProps | undefined
  >(
    account ? [getAccountIdentifier(account), "accountEscape"] : null,
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

/** checks and shows a warning if an account has an escape state that has not yet shown to the user */

export const useAccountEscapeWarning = () => {
  const navigate = useNavigate()

  const accountsWithEscape = useView(allAccountsWithEscapeView)
  const escapeWarningKeys = useArrayStorage(escapeWarningStore)

  const accountWithNewEscape = useMemo(() => {
    return accountsWithEscape.find(
      (account) =>
        !escapeWarningKeys.includes(getEscapeWarningStoreKey(account)),
    )
  }, [escapeWarningKeys, accountsWithEscape])

  useEffect(() => {
    const maybeShowWarning = async () => {
      if (accountWithNewEscape) {
        await clientAccountService.select(accountWithNewEscape)
        navigate(routes.shieldEscapeWarning(accountWithNewEscape.address))
      }
    }
    maybeShowWarning()
  }, [accountWithNewEscape, escapeWarningKeys, navigate])
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
