import { FC } from "react"
import { Link } from "react-router-dom"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { SectionHeader } from "../accounts/SectionHeader"
import { TokenListItem } from "./TokenListItem"
import { useTokensWithBalance } from "./tokens.state"

interface TokenListProps {
  showTitle: boolean
  account: BaseWalletAccount
}

export const TokenList: FC<TokenListProps> = ({ showTitle, account }) => {
  const { isValidating, tokenDetails } = useTokensWithBalance(account)
  return (
    <>
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {tokenDetails.map((token) => (
        <Link key={token.address} to={routes.token(token.address)}>
          <TokenListItem token={token} isLoading={isValidating} />
        </Link>
      ))}
    </>
  )
}
