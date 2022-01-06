import { FC } from "react"
import styled, { css } from "styled-components"
import useSWR from "swr"

import { useMitt } from "../../hooks/useMitt"
import {
  TokenDetails,
  fetchTokenDetails,
  getTokens,
  playgroundToken,
  tokensMitt,
} from "../../utils/tokens"
import { TokenAction, TokenListItem } from "../Token"
import { EmptyWalletAlert } from "./EmptyWalletAlert"
import { SectionHeader } from "./SectionHeader"

interface TokenListProps {
  networkId: string
  walletAddress: string
  canShowEmptyWalletAlert?: boolean
  onShowToken: (token: TokenDetails) => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}

export const TokenList: FC<TokenListProps> = ({
  networkId,
  walletAddress,
  canShowEmptyWalletAlert = true,
  onShowToken,
  onAction,
}) => {
  const tokens = useMitt(
    tokensMitt,
    "UPDATE",
    () => getTokens(walletAddress, networkId),
    true,
  )

  const { data: tokenDetails = [], isValidating } = useSWR(
    [tokens, walletAddress],
    async (tokens, walletAddress) =>
      Promise.all(
        tokens.map((address) =>
          fetchTokenDetails(address, walletAddress, networkId),
        ),
      ),

    { suspense: true, refreshInterval: 30000 },
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
