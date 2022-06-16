import { FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"
import { SectionHeader } from "../accounts/SectionHeader"
import { TokenListItem } from "./TokenListItem"
import {
  prettifyCurrencyValue,
  useSumTokenBalancesToCurrencyValue,
} from "./tokens.service"
import { useTokensWithBalance } from "./tokens.state"

interface TokenListProps {
  showTitle: boolean
  accountAddress: string
  canShowEmptyAccountAlert?: boolean
}

export const TokenList: FC<TokenListProps> = ({ showTitle }) => {
  const { isValidating, tokenDetails } = useTokensWithBalance()
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  return (
    <>
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {sumCurrencyValue && (
        <SectionHeader>
          Total {prettifyCurrencyValue(sumCurrencyValue)}
        </SectionHeader>
      )}
      {tokenDetails.map((token) => (
        <Link key={token.address} to={routes.token(token.address)}>
          <TokenListItem token={token} isLoading={isValidating} />
        </Link>
      ))}
    </>
  )
}
