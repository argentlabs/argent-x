import { FC } from "react"

import {
  TokenDetailsWithBalance,
  useTokensWithBalance,
} from "../../states/tokens"
import { playgroundToken } from "../../utils/tokens"
import { TokenAction, TokenListItem } from "../Token"
import { EmptyWalletAlert } from "./EmptyWalletAlert"
import { SectionHeader } from "./SectionHeader"

interface TokenListProps {
  networkId: string
  walletAddress: string
  canShowEmptyWalletAlert?: boolean
  onShowToken: (token: TokenDetailsWithBalance) => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}

export const TokenList: FC<TokenListProps> = ({
  networkId,
  walletAddress,
  canShowEmptyWalletAlert = true,
  onShowToken,
  onAction,
}) => {
  const { isValidating, data: tokenDetails = [] } = useTokensWithBalance(
    networkId,
    walletAddress,
  )

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return (
    <>
      {canShowEmptyWalletAlert && !hasBalance && (
        <EmptyWalletAlert
          walletAddress={walletAddress}
          mintableAddress={playgroundToken(networkId)?.address}
          onAction={onAction}
        />
      )}
      <SectionHeader>Coins</SectionHeader>
      {tokenDetails.map((token) => (
        <TokenListItem
          key={token.address}
          token={token}
          onClick={() => onShowToken(token)}
          isLoading={isValidating}
        />
      ))}
    </>
  )
}
