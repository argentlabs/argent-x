import { FC } from "react"
import usePromise from "react-promise-suspense"

import { useMitt } from "../../hooks/useMitt"
import {
  TokenDetails,
  fetchTokenDetails,
  getTokens,
  tokensMitt,
} from "../../utils/tokens"
import { TokenAction, TokenListItem } from "../Token"
import { EmptyWalletAlert } from "./EmptyWalletAlert"

interface TokenListProps {
  walletAddress: string
  onShowToken: (token: TokenDetails) => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}

export const TokenList: FC<TokenListProps> = ({
  walletAddress,
  onShowToken,
  onAction,
}) => {
  const tokens = useMitt(
    tokensMitt,
    "UPDATE",
    () => getTokens(walletAddress),
    true,
  )

  const tokenDetails: TokenDetails[] = usePromise(
    async (tokens: string[], walletAddress: string) =>
      Promise.all(
        tokens.map((address) => fetchTokenDetails(address, walletAddress)),
      ),
    [tokens, walletAddress],
    Infinity,
  )

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return (
    <>
      {!hasBalance && (
        <EmptyWalletAlert walletAddress={walletAddress} onAction={onAction} />
      )}
      {tokenDetails.map((token) => (
        <TokenListItem
          key={token.address}
          token={token}
          onClick={() => onShowToken(token)}
        />
      ))}
    </>
  )
}
