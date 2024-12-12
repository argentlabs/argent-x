import useSWR from "swr"
import { useRef } from "react"
import { ledgerService } from "../../../services/ledger"

export function useGetLedgerAccounts(
  networkId: string,
  pageIndex: number,
  pageSize: number,
) {
  const random = useRef(Date.now())
  const { data, error, isValidating } = useSWR(
    ["getLedgerAccounts", random, networkId, pageIndex],
    () => fetchLedgerAccountsWithBalances(networkId, pageIndex, pageSize),
  )

  return {
    accounts: data,
    error,
    loading: !data && isValidating,
  }
}

const fetchLedgerAccountsWithBalances = async (
  networkId: string,
  pageIndex: number,
  pageSize: number,
) => {
  const accounts = await ledgerService.getLedgerAccounts(
    networkId,
    pageIndex * pageSize,
    pageSize,
  )
  // const accountBalances =
  //   await clientTokenService.fetchCurrencyBalanceForAccountsFromBackend(
  //     accounts,
  //   )
  // return accounts
  //   .map((account) => ({
  //     ...account,
  //     currencyBalance:
  //       accountBalances.find((ab) => accountsEqual(ab, account))
  //         ?.currencyBalance ?? "0",
  //   }))
  //   .sort(sortByCurrencyBalance)
  return accounts
}
