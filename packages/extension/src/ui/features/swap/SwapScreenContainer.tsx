import type { FC } from "react"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { NoSwap } from "./NoSwap"
import { Swap } from "./Swap"
import { addressSchema } from "@argent/x-shared"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { BarBackButton, NavigationBar } from "@argent/x-ui"
import { useReturnTo, useRouteTokenAddress } from "../../hooks/useRoute"

export const SwapScreenContainer: FC = () => {
  const isDefaultNetwork = useIsDefaultNetwork()
  const tokenAddress = useRouteTokenAddress()
  const parsedTokenAddress = addressSchema.safeParse(tokenAddress)
  const hasTokenAddress = parsedTokenAddress.success
  const onBack = useNavigateReturnToOrBack()
  const returnTo = useReturnTo()
  return isDefaultNetwork ? (
    <>
      {returnTo && (
        <NavigationBar
          title="Swap"
          leftButton={<BarBackButton onClick={onBack} />}
        />
      )}
      <Swap
        tokenAddress={hasTokenAddress ? parsedTokenAddress.data : undefined}
      />
    </>
  ) : (
    <NoSwap />
  )
}
