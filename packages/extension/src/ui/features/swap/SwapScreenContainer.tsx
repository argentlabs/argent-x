import { FC } from "react"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { NoSwap } from "./NoSwap"
import { Swap } from "./Swap"

export const SwapScreenContainer: FC = () => {
  const isDefaultNetwork = useIsDefaultNetwork()
  return isDefaultNetwork ? <Swap /> : <NoSwap />
}
