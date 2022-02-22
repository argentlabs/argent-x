import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useAppState } from "../../states/app"
import { useTokensWithBalance } from "../../states/tokens"
import { testDappToken } from "../../utils/tokens"
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
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { isValidating, tokenDetails } = useTokensWithBalance()

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return (
    <>
      {canShowEmptyWalletAlert && !hasBalance && (
        <EmptyWalletAlert
          walletAddress={walletAddress}
          mintableAddress={testDappToken(switcherNetworkId)?.address}
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
