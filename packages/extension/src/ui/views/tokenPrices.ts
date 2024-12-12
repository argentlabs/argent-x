import type { Address, Token } from "@argent/x-shared"
import {
  bigDecimal,
  convertTokenAmountToCurrencyValue,
  isEqualAddress,
} from "@argent/x-shared"
import { TokenError } from "../../shared/errors/token"
import type { BaseTokenWithBalance } from "../../shared/token/__new/types/tokenBalance.model"
import type {
  TokenPriceDetails,
  TokenWithBalanceAndPrice,
} from "../../shared/token/__new/types/tokenPrice.model"
import { equalToken, parsedDefaultTokens } from "../../shared/token/__new/utils"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { atomFamily } from "jotai/utils"
import { atomFamilyAccountsEqual } from "../../shared/utils/accountsEqual"
import { useView } from "./implementation/react"
import { atom } from "jotai"
import { useTokensWithHiddenFilter } from "../features/accountTokens/tokens.state"
import { useMemo } from "react"
import {
  allTokenBalancesView,
  allTokenPricesView,
  allTokensView,
} from "./token"

export const addCurrencyValueToTokensList = (
  tokensWithBalance: BaseTokenWithBalance[],
  tokenPrices: TokenPriceDetails[],
  tokens: Token[],
) => {
  return tokensWithBalance.map((tb) => {
    const tokenPrice = tokenPrices.find((cv) => equalToken(cv, tb))
    const token = tokens.find((t) => equalToken(t, tb))

    if (!token) {
      throw new TokenError({
        code: "TOKEN_NOT_FOUND",
        message: `Token ${tb.address} not found`,
      })
    }

    const usdValue = tokenPrice
      ? convertTokenAmountToCurrencyValue({
          amount: tb.balance,
          decimals: token.decimals,
          unitCurrencyValue: tokenPrice.ccyValue,
        })
      : "0.00"

    return {
      ...tb,
      ...token,
      balance: BigInt(tb.balance),
      usdValue: usdValue || "0.00",
    }
  })
}

const tokenBalancesAndOptionalPricesViewFamily = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const accountAddress = account?.address
      const networkId = account?.networkId
      if (!accountAddress || !networkId) {
        return []
      }
      const [allTokenBalances, allTokenPrices, allTokens] = await Promise.all([
        get(allTokenBalancesView),
        get(allTokenPricesView),
        get(allTokensView),
      ])
      const tokenBalances = allTokenBalances.filter(
        (tokenBalance) =>
          isEqualAddress(tokenBalance.account, accountAddress) &&
          tokenBalance.networkId === networkId,
      )
      return addCurrencyValueToTokensList(
        tokenBalances,
        allTokenPrices,
        allTokens,
      )
    })
  },
  atomFamilyAccountsEqual,
)

/**
 *
 * @returns {TokenWithOptionalBigIntBalance[]} - Returns a new array of tokens sorted based on the following criteria:
 * 1. The default tokens are placed at the beginning of the array.
 * 2. The rest of the tokens are sorted in descending order by their currency value.
 *
 */
export const useSortedTokensWithBalances = (account?: BaseWalletAccount) => {
  const tokensWithBalanceAndPrices = useView(
    tokenBalancesAndOptionalPricesViewFamily(account),
  )
  const tokens = useTokensWithHiddenFilter(tokensWithBalanceAndPrices)
  const sortedTokens = useMemo(() => sortTokensWithPrices(tokens), [tokens])
  return sortedTokens
}

export const useAllTokensWithBalances = (account?: BaseWalletAccount) => {
  const tokensWithBalanceAndPrices = useView(
    tokenBalancesAndOptionalPricesViewFamily(account),
  )
  return tokensWithBalanceAndPrices
}

export const useTokenWithBalanceAndUsdValue = (
  networkId?: string,
  tokenAddress?: Address,
  account?: BaseWalletAccount,
) => {
  const tokensWithBalanceAndPrices = useSortedTokensWithBalances(account)
  if (!tokenAddress || !networkId || !account) {
    return undefined
  }
  return tokensWithBalanceAndPrices.find((token) =>
    equalToken(token, { address: tokenAddress, networkId }),
  )
}

export const sortTokensWithPrices = (
  tokensWithBalanceAndPrices: TokenWithBalanceAndPrice[],
) => {
  const defaultTokens: TokenWithBalanceAndPrice[] = []
  const otherTokens: TokenWithBalanceAndPrice[] = []

  tokensWithBalanceAndPrices.forEach((token) => {
    const isDefaultToken = parsedDefaultTokens.some((defaultToken) =>
      equalToken(defaultToken, token),
    )
    if (isDefaultToken) {
      defaultTokens.push(token)
    } else {
      otherTokens.push(token)
    }
  })

  return [
    ...sortTokensByPrice(defaultTokens),
    ...sortTokensByPrice(otherTokens),
  ]
}

export const sortTokensByPrice = (array: TokenWithBalanceAndPrice[]) => {
  array.sort((a, b) => {
    const currencyValueA = bigDecimal.parseCurrency(a.usdValue || "0").value
    const currencyValueB = bigDecimal.parseCurrency(b.usdValue || "0").value

    if (currencyValueA === 0n && currencyValueB === 0n) {
      return 0
    }

    if (currencyValueA === 0n) {
      return 1
    }

    if (currencyValueB === 0n) {
      return -1
    }

    return currencyValueB > currencyValueA ? 1 : -1
  })
  return array
}
