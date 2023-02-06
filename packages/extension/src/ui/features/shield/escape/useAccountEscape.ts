import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { Escape } from "../../../../shared/account/details/getEscape"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { routes } from "../../../routes"
import { selectAccount } from "../../../services/backgroundAccounts"
import { withPolling } from "../../../services/swr"
import { Account } from "../../accounts/Account"
import { useUpdateAccountsOnChainEscapeState } from "../../accounts/accounts.service"
import { useAccounts } from "../../accounts/accounts.state"
import { useAccountTransactions } from "../../accounts/accountTransactions.state"
import {
  escapeWarningStore,
  getEscapeWarningStoreKey,
} from "./escapeWarningStore"

export const accountHasEscape = (account: Account) => Boolean(account.escape)

const pluralise = (value: number, unit: string) => {
  return `${value} ${unit}${value === 1 ? "" : "s"}`
}

export const getActiveFromNow = (activeAt: number) => {
  const activeFromNowMs = Math.max(0, activeAt * 1000 - new Date().getTime())
  /** 7 days max */
  const seconds = Math.floor((activeFromNowMs / 1000) % 60)
  const minutes = Math.floor((activeFromNowMs / (1000 * 60)) % 60)
  const hours = Math.floor((activeFromNowMs / (1000 * 60 * 60)) % 24)
  const days = Math.floor(activeFromNowMs / (1000 * 60 * 60 * 24))
  const activeFromNowPretty =
    days > 0
      ? pluralise(days, "day")
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

export const useLiveAccountEscape = (account?: Account) => {
  return useSWR<LiveAccountEscapeProps | undefined>(
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
}

export const useAccountsWithEscape = () => {
  const allAccounts = useAccounts({ showHidden: true, allNetworks: true })

  const filteredAccounts = useMemo(
    () => allAccounts.filter(accountHasEscape),
    [allAccounts],
  )

  return filteredAccounts
}

/** checks and shows a warning if an account has an escape state that has not yet shown to the user */

export const useAccountEscapeWarning = () => {
  useUpdateAccountsOnChainEscapeState()

  const navigate = useNavigate()

  const accountsWithEscape = useAccountsWithEscape()
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
        console.log(
          "TODO: navigate to warning about this account and add it to the handled warning keys",
          accountWithNewEscape,
        )
        console.warn("TODO: check and unhide hidden account here")
        await selectAccount(accountWithNewEscape)
        navigate(routes.shieldEscapeWarning(accountWithNewEscape.address))
        await escapeWarningStore.push(
          getEscapeWarningStoreKey(accountWithNewEscape),
        )
      }
    }
    maybeShowWarning()
  }, [accountWithNewEscape, escapeWarningKeys, navigate])
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
