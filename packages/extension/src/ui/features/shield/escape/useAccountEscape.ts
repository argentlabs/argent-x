import { useMemo } from "react"
import useSWR from "swr"

import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { withPolling } from "../../../services/swr"
import { Account } from "../../accounts/Account"
import { useAccounts } from "../../accounts/accounts.state"

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

export const useLiveAccountEscape = (account: Account) => {
  return useSWR(
    [getAccountIdentifier(account), "accountEscape"],
    async () => {
      if (!account.escape) {
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
