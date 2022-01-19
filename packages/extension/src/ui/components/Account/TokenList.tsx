import { FC } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { useMitt } from "../../hooks/useMitt"
import { routes } from "../../routes"
import {
  fetchTokenDetails,
  getTokens,
  playgroundToken,
  tokensMitt,
} from "../../utils/tokens"
import { TokenListItem } from "../Token"
import { EmptyWalletAlert } from "./EmptyWalletAlert"
import { SectionHeader } from "./SectionHeader"

interface TokenListProps {
  networkId: string
  walletAddress: string
  canShowEmptyWalletAlert?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  networkId,
  walletAddress,
  canShowEmptyWalletAlert = true,
}) => {
  const navigate = useNavigate()
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
