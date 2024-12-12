import type { FC } from "react"
import { useMemo } from "react"
import type { ParsedStrkDelegatedStakingPosition } from "../../../../shared/defiDecomposition/schema"
import { prettifyTokenBalance } from "../../../../shared/token/prettifyTokenBalance"
import { getActiveFromNow } from "../../../../shared/utils/getActiveFromNow"
import { useTokenInfo } from "../../accountTokens/tokens.state"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"

interface StrkDelegatedStakingStatusProps {
  position: ParsedStrkDelegatedStakingPosition
}

export const StrkDelegatedStakingStatus: FC<
  StrkDelegatedStakingStatusProps
> = ({ position }) => {
  const tokenInfo = useTokenInfo({
    address: position.token.address,
    networkId: position.token.networkId,
  })

  const { status, color } = useMemo(() => {
    if (position.pendingWithdrawal) {
      const timeToAction = getActiveFromNow(
        position.pendingWithdrawal?.withdrawableAfter,
      )
      if (timeToAction.activeFromNowMs !== 0) {
        return {
          status: "Withdraw pending...",
          color: "text-secondary",
        }
      }
      return {
        status: "Ready to withdraw",
        color: "text-success",
      }
    } else if (tokenInfo) {
      const displayBalance = prettifyTokenBalance({
        ...tokenInfo,
        balance: BigInt(position.token.balance),
      })
      return {
        status: displayBalance,
        color: "text-secondary",
      }
    }
    return { status: undefined, color: undefined }
  }, [position.pendingWithdrawal, position.token.balance, tokenInfo])

  if (!status || !color) {
    return null
  }

  return <DefiPositionSubtitle color={color}>{status}</DefiPositionSubtitle>
}
