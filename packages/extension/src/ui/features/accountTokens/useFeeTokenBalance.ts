import { useFeeTokenBalancesView } from "./../../views/tokenBalances"
import { Account } from "../accounts/Account"
import {
  TokenWithBalance,
  feeTokenNeedsTxV3Support,
  classHashSupportsTxV3,
} from "@argent/x-shared"

export const useFeeTokenBalances = (
  account?: Pick<Account, "address" | "networkId">,
) => {
  const feeTokenBalances = useFeeTokenBalancesView(account)

  return account && feeTokenBalances
    ? feeTokenBalances.map((balance) => ({
        ...balance,
        amount: BigInt(balance.balance),
        account,
      }))
    : []
}

export const usePossibleFeeTokenBalances = (
  account?: Pick<Account, "address" | "networkId" | "classHash">,
) => {
  const feeTokenBalances = useFeeTokenBalances(account)

  return feeTokenBalances.filter(
    (tk) =>
      !feeTokenNeedsTxV3Support(tk) ||
      classHashSupportsTxV3(account?.classHash),
  )
}

export const useBigIntFeeTokenBalances = (
  account?: Pick<Account, "address" | "networkId">,
): TokenWithBalance[] => {
  const feeTokenBalances = useFeeTokenBalances(account)

  return feeTokenBalances.map((ftb) => ({
    ...ftb,
    balance: ftb.amount,
  }))
}

export const useHasFeeTokenBalance = (
  account?: Pick<Account, "address" | "networkId">,
) => {
  const feeTokenBalances = useFeeTokenBalances(account)
  return feeTokenBalances.some((balance) => balance.amount > 0n)
}
