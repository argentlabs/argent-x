import type { FC } from "react"

import type { TokenListItemVariant } from "./TokenListItem"
import { TokenListItem } from "./TokenListItem"
import { useTokenBalanceForAccount } from "./useTokenBalanceForAccount"
import type { TokenWithBalanceAndPrice } from "../../../shared/token/__new/types/tokenPrice.model"
import type { WalletAccount } from "../../../shared/wallet.model"
import { prettifyCurrencyValue } from "@argent/x-shared"
import { prettifyTokenBalance } from "../../../shared/token/prettifyTokenBalance"
import type { CustomButtonCellProps } from "../../components/CustomButtonCell"

export interface TokenListItemContainerProps extends CustomButtonCellProps {
  token: TokenWithBalanceAndPrice
  account: Pick<WalletAccount, "id" | "network" | "address" | "networkId">
  variant?: TokenListItemVariant
  showTokenSymbol?: boolean
}

/**
 * Fetches the token balance or error, currency value and renders them with {@link TokenListItem}
 */

export const TokenListItemContainer: FC<TokenListItemContainerProps> = ({
  token,
  account,
  variant,
  ...rest
}) => {
  const tokenWithBalance = useTokenBalanceForAccount({
    token,
    account,
  })

  const shouldShow =
    token.showAlways ||
    (!token.hidden &&
      (token.custom ||
        (tokenWithBalance?.balance && tokenWithBalance.balance > 0n)))
  if (!shouldShow || tokenWithBalance === undefined) {
    return null
  }

  const { name, iconUrl, symbol } = token
  const balance = prettifyTokenBalance(token)
  const currencyValue = prettifyCurrencyValue(token.usdValue, undefined, {
    allowLeadingZerosInDecimalPart: false,
  })

  const tokenName = name === "Ether" ? "Ethereum" : name

  return (
    <TokenListItem
      {...rest}
      name={tokenName}
      iconUrl={iconUrl}
      symbol={symbol}
      balance={balance}
      currencyValue={currencyValue}
      isLoading={false}
    />
  )
}
