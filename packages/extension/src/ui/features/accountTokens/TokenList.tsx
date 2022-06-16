import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { prettifyCurrencyValue } from "../../../shared/tokenPrice.service"
import { routes } from "../../routes"
import { SectionHeader } from "../accounts/SectionHeader"
import { TokenListItem } from "./TokenListItem"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

interface TokenListProps {
  showTitle: boolean
  accountAddress: string
  canShowEmptyAccountAlert?: boolean
}

const TotalCurrencyValue = styled(SectionHeader)`
  text-align: center;
`

export const TokenList: FC<TokenListProps> = ({ showTitle }) => {
  const { isValidating, tokenDetails } = useTokensWithBalance()
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  return (
    <>
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {sumCurrencyValue !== undefined && (
        <TotalCurrencyValue>
          Total {prettifyCurrencyValue(sumCurrencyValue)}
        </TotalCurrencyValue>
      )}
      {tokenDetails.map((token) => (
        <Link key={token.address} to={routes.token(token.address)}>
          <TokenListItem token={token} isLoading={isValidating} />
        </Link>
      ))}
    </>
  )
}
