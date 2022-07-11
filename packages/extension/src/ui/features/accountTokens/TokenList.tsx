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
  navigateToSend?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  showTitle = false,
  showTokenSymbol = false,
  isValidating,
  variant,
  tokenList,
  navigateToSend = false,
}) => {
  if (!tokenList) {
    return null
  }

  return (
    <>
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {tokenList.map((token) => (
        <Link
          key={token.address}
          to={
            navigateToSend
              ? routes.sendToken(token.address)
              : routes.token(token.address)
          }
        >
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
