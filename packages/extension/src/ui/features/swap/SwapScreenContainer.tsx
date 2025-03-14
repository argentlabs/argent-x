import { addressSchema } from "@argent/x-shared"
import { BarBackButton, BarIconButton, L2, NavigationBar } from "@argent/x-ui"
import { FilterSecondaryIcon } from "@argent/x-ui/icons"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import {
  useCurrentPathnameWithQuery,
  useReturnTo,
  useRouteTokenAddress,
} from "../../hooks/useRoute"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { NoSwap } from "./NoSwap"
import { useUserState } from "./state/user"
import { Swap } from "./Swap"
import { ampli } from "../../../shared/analytics"

export const SwapScreenContainer: FC = () => {
  const isDefaultNetwork = useIsDefaultNetwork()
  const tokenAddress = useRouteTokenAddress()
  const parsedTokenAddress = addressSchema.safeParse(tokenAddress)
  const hasTokenAddress = parsedTokenAddress.success
  const onBack = useNavigateReturnToOrBack()
  const returnTo = useReturnTo()
  const { userSlippageTolerance } = useUserState()
  const navigate = useNavigate()
  const currentPath = useCurrentPathnameWithQuery()

  const goToSettings = () => {
    void ampli.swapSlippageSettingClicked({
      "wallet platform": "browser extension",
    })
    navigate(routes.swapSettings(currentPath))
  }

  const SettingsButton = () => {
    return (
      <Flex alignItems="center" gap="2">
        <L2 color="text-secondary">{userSlippageTolerance / 100}%</L2>
        <BarIconButton aria-label="Show swap settings" onClick={goToSettings}>
          <FilterSecondaryIcon />
        </BarIconButton>
      </Flex>
    )
  }
  return isDefaultNetwork ? (
    <>
      <NavigationBar
        title="Swap"
        {...(returnTo && { leftButton: <BarBackButton onClick={onBack} /> })}
        rightButton={<SettingsButton />}
      />
      <Swap
        tokenAddress={hasTokenAddress ? parsedTokenAddress.data : undefined}
      />
    </>
  ) : (
    <NoSwap />
  )
}
