import {
  icons,
  Button,
  NavigationContainer,
  BarCloseButton,
  Warning,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes, useCurrentPathnameWithQuery } from "../../../routes"
import { useAppState } from "../../../app.state"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"

const { ExpandIcon } = icons

export const AccountDeprecatedModal = () => {
  const onBack = useNavigateReturnToOrBack()
  const returnTo = useCurrentPathnameWithQuery()
  const { switcherNetworkId } = useAppState()
  const navigate = useNavigate()
  const navigateToHiddenAccounts = () => {
    navigate(routes.accountsHidden(switcherNetworkId, returnTo))
  }
  return (
    <NavigationContainer
      isAbsolute
      rightButton={<BarCloseButton onClick={onBack} />}
    >
      <Flex py={4} px={5} direction="column" flex={1}>
        <Warning
          title="Account deprecated"
          subtitle="This is a deprecated account that can’t be upgraded or used any longer. Please contact Starknet for more information"
        >
          <Button
            as={"a"}
            size={"sm"}
            colorScheme={"transparent"}
            color="text.secondary"
            rightIcon={<ExpandIcon />}
            href="https://starknet.io/discord/"
            target="_blank"
          >
            Starknet discord
          </Button>
        </Warning>
        <Button onClick={navigateToHiddenAccounts} colorScheme="primary">
          Hide account
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
