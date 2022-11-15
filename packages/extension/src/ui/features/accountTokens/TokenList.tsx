import { CellStack } from "@argent/ui"
import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"

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
  showTokenSymbol = false,
  isValidating,
  variant,
  tokenList,
  navigateToSend = false,
}) => {
  const navigate = useNavigate()
  if (!tokenList) {
    return null
  }
  return (
    <CellStack>
      {tokenList.map((token) => (
        <TokenListItemContainer
          key={token.address}
          token={token}
          isLoading={isValidating}
          variant={variant}
          showTokenSymbol={showTokenSymbol}
          onClick={() => {
            navigate(
              navigateToSend
                ? routes.sendToken(token.address)
                : routes.token(token.address),
            )
          }}
        />
      ))}
    </CellStack>
  )
}
