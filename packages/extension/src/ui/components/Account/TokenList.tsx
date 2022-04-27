import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useAppState } from "../../states/app"
import { useTokensWithBalance } from "../../states/tokens"
import { testDappToken } from "../../utils/tokens"
import { TokenListItem } from "../Token"
import { EmptyAccountAlert } from "./EmptyAccountAlert"
import { SectionHeader } from "./SectionHeader"

interface TokenListProps {
  showTitle: boolean
  accountAddress: string
  canShowEmptyAccountAlert?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  showTitle,
  accountAddress,
  canShowEmptyAccountAlert = true,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { isValidating, tokenDetails } = useTokensWithBalance()

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return (
    <>
      {canShowEmptyAccountAlert && !hasBalance && (
        <EmptyAccountAlert
          accountAddress={accountAddress}
          mintableAddress={testDappToken(switcherNetworkId)?.address}
        />
      )}
      {showTitle && <SectionHeader>Tokens</SectionHeader>}
      {tokenDetails.map((token) => (
        <TokenListItem
          key={token.address}
          token={token}
          onClick={() => navigate(routes.token(token.address))}
          isLoading={isValidating}
        />
      ))}
    </>
  )
}
