import {
  Token,
  bigDecimal,
  convertTokenAmountToCurrencyValue,
} from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { TokenError } from "../../shared/errors/token"
import { tokenPriceRepo } from "../../shared/token/__new/repository/tokenPrice"
import { BaseTokenWithBalance } from "../../shared/token/__new/types/tokenBalance.model"
import {
  TokenPriceDetails,
  TokenWithBalanceAndPrice,
} from "../../shared/token/__new/types/tokenPrice.model"
import { equalToken, parsedDefaultTokens } from "../../shared/token/__new/utils"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { allTokensView } from "./token"
import { tokenBalancesForAccountView } from "./tokenBalances"

const tokenPricesAtom = atomFromRepo(tokenPriceRepo)

export const tokenPricesView = atom(async (get) => {
  const tokenPrices = await get(tokenPricesAtom)
  return tokenPrices
})

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
      usdValue: usdValue || "0.00",
    }
  })
}

export const tokenBalancesAndOprionalPricesView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const tokensWithBalance = await get(tokenBalancesForAccountView(account))
      const tokenPrices = await get(tokenPricesView)
      const tokens = await get(allTokensView).then((tk) =>
        tk.filter((t) => tokensWithBalance.some((tb) => equalToken(tb, t))),
      )
      return addCurrencyValueToTokensList(
        tokensWithBalance,
        tokenPrices,
        tokens,
      )
    })
  },
)

/**
 *
 * @returns {TokenWithOptionalBigIntBalance[]} - Returns a new array of tokens sorted based on the following criteria:
 * 1. The default tokens are placed at the beginning of the array.
 * 2. The rest of the tokens are sorted in descending order by their currency value.
 *
 */
export const sortedTokensWithBalances = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      if (!account) {
        return []
      }
      const tokensWithBalanceAndPrices = await get(
        tokenBalancesAndOprionalPricesView(account),
      )

      // Separate default tokens and other tokens
      return sortTokensWithPrices(tokensWithBalanceAndPrices)
    })
  },
)

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

  // Sort other tokens by balance
  otherTokens.sort((a, b) => {
    // Convert balances to numbers, treating undefined balances as 0
    const currencyValueA = bigDecimal.parseCurrency(a.usdValue || "0").value
    const currencyValueB = bigDecimal.parseCurrency(b.usdValue || "0").value

    // If both balances are 0, keep the original order
    if (currencyValueA === 0n && currencyValueB === 0n) {
      return 0
    }

    // If balanceA is 0, put it after balanceB
    if (currencyValueA === 0n) {
      return 1
    }

    // If balanceB is 0, put it after balanceA
    if (currencyValueB === 0n) {
      return -1
    }

    // If both balances are non-zero, sort in descending order
    return currencyValueB > currencyValueA ? 1 : -1
  })

  // Return the sorted tokens
  return [...defaultTokens, ...otherTokens]
}
