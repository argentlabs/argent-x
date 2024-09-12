import { addressSchema, prettifyCurrencyValue } from "@argent/x-shared"
import { TokenButton, getTokenIconUrl } from "@argent/x-ui"
import { FC } from "react"
import { prettifyTokenBalance } from "../../../../shared/token/prettifyTokenBalance"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import { Token } from "../../../../shared/token/__new/types/token.model"
import { useTokenBalanceForAccount } from "../../accountTokens/useTokenBalanceForAccount"

interface OwnedTokenProps {
  token: Token
  onClick: () => void
}

const OwnedToken: FC<OwnedTokenProps> = ({ onClick, token }) => {
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
      symbol={tokenDetailsWithBalance.symbol}
      showTokenSymbol
      valueLabelPrimary={displayBalance}
      valueLabelSecondary={displayCurrencyValue}
      w="100%"
    />
  )
}

export { OwnedToken }
