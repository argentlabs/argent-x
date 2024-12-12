import {
  BarBackButton,
  Button,
  Empty,
  icons,
  NavigationContainer,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"

import { SMART_ACCOUNT_NETWORK_ID } from "../../../shared/smartAccount/constants"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { SmartAccountActivate } from "./SmartAccountActivate"
import { SmartAccountNotReady } from "./SmartAccountNotReady"
import { useRouteWalletAccount } from "./useRouteWalletAccount"
import { useToggleSmartAccountRoute } from "./useToggleSmartAccountRoute"

const { ShieldSecondaryIcon } = icons

export const SmartAccountStartScreen: FC = () => {
  const account = useRouteWalletAccount()
  const network = useCurrentNetwork()
  const { isLoading, startToggleSmartAccountFlow } =
    useToggleSmartAccountRoute()

  const isAvailable = network.id === SMART_ACCOUNT_NETWORK_ID
  const cannotProceed = account?.needsDeploy && account.type !== "smart"

  return (
    <NavigationContainer leftButton={<BarBackButton />}>
      {isAvailable ? (
        cannotProceed ? (
          <SmartAccountNotReady />
        ) : (
          <Flex flexDirection={"column"} flex={1} px={4} pb={4}>
            {!account?.guardian && <SmartAccountActivate />}
            <Flex flex={1} />
            <Button
              onClick={() => void startToggleSmartAccountFlow(account)}
              colorScheme={"primary"}
              disabled={isLoading || cannotProceed}
              isLoading={isLoading}
              loadingText={"Verifying email"}
            >
              Next
            </Button>
          </Flex>
        )
      ) : (
        <Empty
          icon={<ShieldSecondaryIcon />}
          title={"Smart Account is not enabled for this network"}
        />
      )}
    </NavigationContainer>
  )
}
