import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useGlobalState } from "../../states/global"
import { useTokensWithBalance } from "../../states/tokens"
import { playgroundToken } from "../../utils/tokens"
import { TokenListItem } from "../Token"
import { EmptyWalletAlert } from "./EmptyWalletAlert"
import { SectionHeader } from "./SectionHeader"

interface TokenListProps {
  walletAddress: string
  canShowEmptyWalletAlert?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  walletAddress,
  canShowEmptyWalletAlert = true,
}) => {
  const { networkId } = useGlobalState()
  const navigate = useNavigate()
  const { isValidating, data: tokenDetails = [] } = useTokensWithBalance()

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return (
    <>
      {canShowEmptyWalletAlert && !hasBalance && (
        <EmptyWalletAlert
          walletAddress={walletAddress}
          mintableAddress={playgroundToken(networkId)?.address}
        />
      )}
      <SectionHeader>Coins</SectionHeader>
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
