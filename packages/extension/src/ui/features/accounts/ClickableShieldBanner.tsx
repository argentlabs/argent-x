import { L2, icons } from "@argent/ui"

import { Button, Flex, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

const { ArgentShieldIcon } = icons

export const ClickableShieldBanner = ({ address }: { address: string }) => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(routes.shieldAccountStart(address))
  }
  return (
    <Button
      size="auto"
      onClick={handleClick}
      py={2}
      px={3}
      justifyContent="space-between"
      alignItems="center"
      w="full"
      roundedTop="none"
      roundedBottom="lg"
    >
      <Flex alignItems="center" gap={1} color="neutrals.300">
        <ArgentShieldIcon />
        <L2 as={Text}>Argent Shield is not activated</L2>
      </Flex>
      <L2 as={Text} color="neutrals.500">
        Click to enable
      </L2>
    </Button>
  )
}
