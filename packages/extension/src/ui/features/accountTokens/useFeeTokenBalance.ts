import { feeTokenBalancesView } from "./../../views/tokenBalances"
import { Account } from "../accounts/Account"
import { useView } from "../../views/implementation/react"
import { Address } from "@argent/shared"
import { BaseTokenWithBalance } from "../../../shared/token/__new/types/tokenBalance.model"
import { num } from "starknet"

export const useFeeTokenBalances = (
  account?: Pick<Account, "address" | "networkId">,
) => {
  const feeTokenBalances = useView(feeTokenBalancesView(account))
  const numberFeeTokenBalances = feeTokenBalances?.map((balance) => ({
    ...balance,
    amount: BigInt(balance.balance),
  }))
  return numberFeeTokenBalances ?? []
}

export const useHasFeeTokenBalance = (
  account?: Pick<Account, "address" | "networkId">,
) => {
  const feeTokenBalances = useFeeTokenBalances(account)
  return feeTokenBalances.some((balance) => balance.amount > 0n)
}

interface PickBestFeeTokenOptions {
  avoid?: Address[]
  prefer?: Address[]
}

export const pickBestFeeToken = (
  balances: BaseTokenWithBalance[],
  { avoid = [], prefer = [] }: PickBestFeeTokenOptions = {},
) => {
  // sort by prefered tokens, neutral tokens, then avoid tokens
  // sort each group by the provided array order and secondarily by balance
  const sortedBalances = balances
    .map(
      (balance) =>
        [
          balance,
          {
            balance: num.toBigInt(balance.balance),
            prefer: prefer.includes(balance.address),
            avoid: avoid.includes(balance.address),
          },
        ] as const,
    )
    .sort(([aa, a], [bb, b]) => {
      if (a.prefer && !b.prefer) {
        return -1
      }
      if (!a.prefer && b.prefer) {
        return 1
      }
      if (a.prefer && b.prefer) {
        return Number(prefer.indexOf(aa.address) - prefer.indexOf(bb.address))
      }
      if (a.avoid && !b.avoid) {
        return 1
      }
      if (!a.avoid && b.avoid) {
        return -1
      }
      if (a.avoid && b.avoid) {
        return Number(avoid.indexOf(bb.address) - avoid.indexOf(aa.address))
      }
      return Number(b.balance - a.balance)
    })
    .map(([balance]) => balance)

  // filter tokens with 0 balance out
  const filteredBalances = sortedBalances.filter(
    (balance) => num.toBigInt(balance.balance) > 0n,
  )

  // return the first token with a balance or the first token if all balances are 0
  return filteredBalances[0] ?? sortedBalances[0]
}
