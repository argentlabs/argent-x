import { FC } from "react"
import { Link } from "react-router-dom"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { SectionHeader } from "../accounts/SectionHeader"
import { TokenListItemContainer, TokenListItemVariant } from "./TokenListItem"
import { useTokensWithBalance } from "./tokens.state"

interface TokenListProps {
  showTitle: boolean
  account: BaseWalletAccount
  variant?: TokenListItemVariant
}

export const TokenList: FC<TokenListProps> = ({
  showTitle,
  account,
  variant,
}) => {
  const { isValidating, tokenDetails } = useTokensWithBalance(account)
  return (
    <>
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {tokenDetails.map((token) => (
        <Link key={token.address} to={routes.token(token.address)}>
          <TokenListItemContainer
            token={token}
            isLoading={isValidating}
            variant={variant}
          />
        </Link>
      ))}
    </>
  )
}
