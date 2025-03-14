import { addressSchema, prettifyCurrencyValue } from "@argent/x-shared"
import { getTokenIconUrl, TokenButton } from "@argent/x-ui"
import type { FC } from "react"
import { prettifyTokenBalance } from "../../../../shared/token/prettifyTokenBalance"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import type { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import { useTokenBalanceForAccount } from "../../accountTokens/useTokenBalanceForAccount"

interface PayTokenProps {
  token: Token
  onClick: () => void
}

const PayToken: FC<PayTokenProps> = ({ onClick, token }) => {
  const account = useView(selectedAccountView)

  const tokenBalance = useTokenBalanceForAccount({ token, account })

  const balance = BigInt(tokenBalance?.balance || "0")

  const currencyValue = useTokenAmountToCurrencyValue(token, balance)

  if (!token || balance === 0n) {
    return <></>
  }

  const tokenDetailsWithBalance: TokenWithOptionalBigIntBalance = {
    name: token.name || "",
    symbol: token.symbol || "",
    decimals: token.decimals,
    address: addressSchema.parse(token.address),
    networkId: token.networkId,
    iconUrl: token.iconUrl,
    balance: BigInt(tokenBalance?.balance || "0"),
  }

  const displayBalance = prettifyTokenBalance(tokenDetailsWithBalance)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  return (
    <TokenButton
      onClick={onClick}
      name={tokenDetailsWithBalance.name}
      image={tokenDetailsWithBalance.iconUrl || ""}
      getTokenIconUrl={getTokenIconUrl}
      valueLabelPrimary={displayCurrencyValue}
      valueLabelSecondary={displayBalance}
      symbol={tokenDetailsWithBalance.symbol}
      w="100%"
    />
  )
}

export { PayToken }
