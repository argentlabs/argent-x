import { icons } from "@argent/ui"

import { Box, Flex, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

const { ArgentShieldIcon } = icons

export const ClickableShieldBanner = ({ address }: { address: string }) => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(routes.shieldAccountStart(address))
  }
  return (
    <Box
      onClick={handleClick}
      p={2}
      px={3}
      backgroundColor="neutrals.700"
      borderBottomRadius="lg"
      cursor="pointer"
      _hover={{ backgroundColor: "neutrals.600" }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center">
          <ArgentShieldIcon />{" "}
          <Text fontSize="2xs" color="neutrals.300" ml={1}>
            Argent Shield is not activated
          </Text>
        </Flex>
        <Text fontSize="2xs" color="neutrals.500">
          Click to enable
        </Text>
      </Flex>
    </Box>
  )
}
