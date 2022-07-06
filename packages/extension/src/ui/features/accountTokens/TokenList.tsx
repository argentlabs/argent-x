import { FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"
import { SectionHeader } from "../accounts/SectionHeader"
import { TokenListItemContainer, TokenListItemVariant } from "./TokenListItem"
import { TokenDetailsWithBalance } from "./tokens.state"

interface TokenListProps {
  showTitle?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  tokenList: TokenDetailsWithBalance[]
  isValidating: boolean
}

export const TokenList: FC<TokenListProps> = ({
  showTitle = false,
  showTokenSymbol = false,
  isValidating,
  variant,
  tokenList,
}) => {
  if (!tokenList) {
    return <></>
  }

  return (
    <>
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {tokenList.map((token) => (
        <Link key={token.address} to={routes.token(token.address)}>
          <TokenListItemContainer
            token={token}
            isLoading={isValidating}
            variant={variant}
            showTokenSymbol={showTokenSymbol}
          />
        </Link>
      ))}
    </>
  )
}
