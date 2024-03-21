import { TokenWithBalance } from "@argent/x-shared"
import { NavigationContainer } from "@argent/x-ui"
import { FC, ReactNode } from "react"
import { PageWrapper } from "../../../../components/Page"
import { Grid } from "@chakra-ui/react"
import { TokenOption } from "../../../../components/TokenOption"
import { getTokenIconUrl } from "../../../accountTokens/TokenIcon"
import { formatTokenBalance } from "../../../../services/tokens/utils"

function toTokenView(token: TokenWithBalance): {
  address: string
  name: string
  symbol: string
  balance: string
  image: string
} {
  return {
    ...token,
    image: getTokenIconUrl({ ...token, url: token.image }),
    balance: `${formatTokenBalance(6, token.balance, token.decimals)} ${
      token.symbol
    }`,
  }
}

interface MinBalances {
  [address: string]: bigint
}

interface TokenPickerScreenProps {
  rightButton?: ReactNode

  tokens: TokenWithBalance[]
  minBalances?: MinBalances

  onSelect: (token: TokenWithBalance) => void
}

export const TokenPickerScreen: FC<TokenPickerScreenProps> = ({
  rightButton,
  tokens,
  minBalances = {},
  onSelect,
}) => {
  return (
    <NavigationContainer title={"Select a token"} rightButton={rightButton}>
      <PageWrapper>
        <Grid templateColumns="1fr" gap={4}>
          {tokens.map((token) => {
            const tokenView = toTokenView(token)
            const minBalance = minBalances[token.address] ?? BigInt(1)
            const disabled = token.balance < minBalance
            return (
              <TokenOption
                disabled={disabled}
                key={tokenView.address}
                imageSrc={tokenView.image}
                name={tokenView.name}
                symbol={tokenView.symbol}
                balance={tokenView.balance}
                onTokenSelect={() => onSelect(token)}
              />
            )
          })}
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
