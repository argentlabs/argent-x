import { feeTokenBalancesView } from "./../../views/tokenBalances"
import { Account } from "../accounts/Account"
import { useView } from "../../views/implementation/react"
import { TokenWithBalance } from "@argent/shared"
import {
  classHashSupportsTxV3,
  feeTokenNeedsTxV3Support,
} from "../../../shared/network/txv3"

export const useFeeTokenBalances = (
  account?: Pick<Account, "address" | "networkId">,
) => {
  const feeTokenBalances = useView(feeTokenBalancesView(account))

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
