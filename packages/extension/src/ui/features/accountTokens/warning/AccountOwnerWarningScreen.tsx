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

export const AccountOwnerWarningScreen = () => {
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
          title="Can’t access account"
          subtitle="You can not access this account. It can not be used any longer. Please contact Argent Support for further help."
        >
          <Button
            as={"a"}
            size={"sm"}
            colorScheme={"transparent"}
            color="text.secondary"
            rightIcon={<ExpandIcon />}
            href="https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"
            target="_blank"
          >
            Contact Argent
          </Button>
        </Warning>
        <Button onClick={navigateToHiddenAccounts} colorScheme="primary">
          Hide account
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
