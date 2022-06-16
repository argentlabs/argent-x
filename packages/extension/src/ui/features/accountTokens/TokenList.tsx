import { FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"
import { SectionHeader } from "../accounts/SectionHeader"
import { TokenListItem } from "./TokenListItem"
import { useTokenPricing } from "./tokens.service"
import { useTokensWithBalance } from "./tokens.state"

interface TokenListProps {
  showTitle: boolean
  accountAddress: string
  canShowEmptyAccountAlert?: boolean
}

export const TokenList: FC<TokenListProps> = ({ showTitle }) => {
  const { isValidating, tokenDetails } = useTokensWithBalance()
  console.log({ tokenDetails })
  console.log(JSON.stringify(tokenDetails, null, 2))
  // const testing = useTokenPricing(tokenDetails[0])
  // console.log({ testing })

  return (
    <>
      {/* {<pre>{JSON.stringify(tokenDetails, null, 2)}</pre>} */}
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {tokenDetails.map((token) => (
        <Link key={token.address} to={routes.token(token.address)}>
          <TokenListItem token={token} isLoading={isValidating} />
        </Link>
      ))}
    </>
  )
}
