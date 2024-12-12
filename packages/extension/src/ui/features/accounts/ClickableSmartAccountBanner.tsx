import { icons, L2Bold } from "@argent/x-ui"

import { Button, Flex, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { useToggleSmartAccountRoute } from "../smartAccount/useToggleSmartAccountRoute"
import type { WalletAccount } from "../../../shared/wallet.model"

const { ShieldSecondaryIcon } = icons

export const ClickableSmartAccountBanner = ({
  account,
}: {
  account: WalletAccount
}) => {
  const navigate = useNavigate()
  const { startToggleSmartAccountFlow } = useToggleSmartAccountRoute()

  const onStartSmartAccountFlow = async () => {
    if (!account.guardian) {
      navigate(routes.smartAccountStart(account.id))
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
        <ShieldSecondaryIcon />
        <L2Bold data-testid="smart-account-not-activated" as={Text}>
          Smart Account is not activated
        </L2Bold>
      </Flex>
      <L2Bold as={Text} color="neutrals.500">
        Click to enable
      </L2Bold>
    </Button>
  )
}
