import { ExpandIcon } from "@argent/x-ui/icons"
import {
  BarCloseButton,
  Button,
  NavigationContainer,
  Warning,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { useCurrentPathnameWithQuery } from "../../../hooks/useRoute"
import { routes } from "../../../../shared/ui/routes"
import { useNavigateReturnToOr } from "../../../hooks/useNavigateReturnTo"
import { selectedNetworkIdView } from "../../../views/network"
import { useView } from "../../../views/implementation/react"
import { clientAccountService } from "../../../services/account"
import { voidify } from "@argent/x-shared"

export const AccountDeprecatedModal = () => {
  const onBack = useNavigateReturnToOr(routes.accountTokens())
  const returnTo = useCurrentPathnameWithQuery()
  const networkId = useView(selectedNetworkIdView)

  const onClose = async () => {
    await clientAccountService.autoSelectAccountOnNetwork(networkId)
    onBack()
  }

  const selectedNetworkId = useView(selectedNetworkIdView)
  const navigate = useNavigate()
  const navigateToHiddenAccounts = () => {
    navigate(routes.accountsHidden(selectedNetworkId, returnTo))
  }
  return (
    <NavigationContainer
      isAbsolute
      rightButton={<BarCloseButton onClick={voidify(onClose)} />}
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
            color="text-secondary"
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
