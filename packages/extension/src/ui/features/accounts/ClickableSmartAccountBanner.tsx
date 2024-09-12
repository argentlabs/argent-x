import { L2, iconsDeprecated } from "@argent/x-ui"

import { Button, Flex, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { useToggleSmartAccountRoute } from "../smartAccount/useToggleSmartAccountRoute"
import { WalletAccount } from "../../../shared/wallet.model"

const { SmartAccountActiveIcon } = iconsDeprecated

export const ClickableSmartAccountBanner = ({
  account,
}: {
  account: WalletAccount
}) => {
  const navigate = useNavigate()
  const { startToggleSmartAccountFlow } = useToggleSmartAccountRoute()

  const onStartSmartAccountFlow = async () => {
    if (!account.guardian) {
      navigate(routes.smartAccountStart(account.address))
    } else {
      await startToggleSmartAccountFlow(account)
    }
  }

  return (
    <Button
      size="auto"
      onClick={() => void onStartSmartAccountFlow()}
      py={2}
      px={3}
      justifyContent="space-between"
      alignItems="center"
      w="full"
      roundedTop="none"
      roundedBottom="lg"
    >
      <Flex alignItems="center" gap={1} color="neutrals.300">
        <SmartAccountActiveIcon />
        <L2 data-testid="smart-account-not-activated" as={Text}>
          Smart Account is not activated
        </L2>
      </Flex>
      <L2 as={Text} color="neutrals.500">
        Click to enable
      </L2>
    </Button>
  )
}
