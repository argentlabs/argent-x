import { Address, isEqualAddress } from "@argent/shared"
import { FeeTokenPreferenceOption } from "./types/preference.model"
import { num } from "starknet"
import { arrayOrderWith } from "../utils/arrayOrderWith"
import { FEE_TOKEN_PREFERENCE_BY_ADDRESS } from "./constants"
import { ETH_TOKEN_ADDRESS } from "../network/constants"

export const pickBestFeeToken = <
  BS extends { address: Address; balance: string | bigint },
>(
  balances: BS[],
  { avoid = [], prefer = [] }: FeeTokenPreferenceOption = {},
): BS => {
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
      // if one of them has no balance, it should be last
      if (!a.balance && b.balance) return 1
      if (a.balance && !b.balance) return -1

      // otherwise, sort by prefer, then avoid, then by prefer/avoid array order, then by fee token preference
      if (a.prefer !== b.prefer) {
        return b.prefer ? 1 : -1
      }
      if (a.avoid !== b.avoid) {
        return a.avoid ? 1 : -1
      }

      if (a.prefer && b.prefer) {
        const preferArrayPrio = arrayOrderWith(
          prefer,
          aa.address,
          bb.address,
          isEqualAddress,
        )
        if (preferArrayPrio !== 0) {
          return preferArrayPrio
        }
      }
      if (a.avoid && b.avoid) {
        const avoidArrayPrio = arrayOrderWith(
          prefer,
          bb.address,
          aa.address,
          isEqualAddress,
        )
        if (avoidArrayPrio !== 0) {
          return avoidArrayPrio
        }
      }

      return arrayOrderWith(
        FEE_TOKEN_PREFERENCE_BY_ADDRESS,
        aa.address,
        bb.address,
        isEqualAddress,
      )
    })
    .map(([balance]) => balance)

  // filter tokens with 0 balance out
  const filteredBalances = sortedBalances.filter(
    (balance) => num.toBigInt(balance.balance) > 0n,
  )

  const result: BS = filteredBalances[0] ??
    sortedBalances[0] ?? { address: ETH_TOKEN_ADDRESS, balance: "0" } // fallback to ETH to prevent errors

  // return the first token with a balance or the first token if all balances are 0, or a default object if no tokens are found
  return result
}
