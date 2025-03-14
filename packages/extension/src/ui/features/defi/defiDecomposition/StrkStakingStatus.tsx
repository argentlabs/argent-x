import type { FC } from "react"
import { useMemo } from "react"
import type { ParsedStakingPosition } from "../../../../shared/defiDecomposition/schema"
import { prettifyTokenBalance } from "../../../../shared/token/prettifyTokenBalance"
import { useTokenInfo } from "../../accountTokens/tokens.state"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"
import { useTokenBalanceForAccount } from "../../accountTokens/useTokenBalanceForAccount"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"

interface StrkLiquidStakingStatusProps {
  position: ParsedStakingPosition
}

export const StrkStakingStatus: FC<StrkLiquidStakingStatusProps> = ({
  position,
}) => {
  const selectedAccount = useView(selectedAccountView)

  const tokenInfo = useTokenInfo({
    address: position.liquidityToken?.address,
    networkId: position.liquidityToken?.networkId,
  })

  const tokenBalance = useTokenBalanceForAccount({
    token: tokenInfo,
    account: selectedAccount,
  })

  const { status, color } = useMemo(() => {
    if (tokenInfo) {
      const displayBalance = prettifyTokenBalance({
        ...tokenInfo,
        balance: tokenBalance?.balance ?? BigInt(0),
      })
      return {
        status: displayBalance,
        color: "text-secondary",
      }
    }
    return { status: undefined, color: undefined }
  }, [tokenBalance?.balance, tokenInfo])

  if (!status || !color) {
    return null
  }

  return <DefiPositionSubtitle color={color}>{status}</DefiPositionSubtitle>
}
