import {
  icons,
  Button,
  NavigationContainer,
  H3,
  BarCloseButton,
  P3,
  B3,
} from "@argent/ui"
import { Box, Circle, Flex, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"
import { useAppState } from "../../app.state"

const { AlertIcon, ExpandIcon } = icons

export const AccountDeprecatedModal = () => {
  const { switcherNetworkId } = useAppState()
  const navigate = useNavigate()
  const navigateToHiddenAccounts = () => {
    navigate(routes.accountsHidden(switcherNetworkId))
  }

  return (
    <NavigationContainer rightButton={<BarCloseButton />}>
      <Flex
        py={4}
        px={5}
        direction="column"
        justifyContent="space-between"
        alignContent="center"
        borderRadius="2xl"
        width="full"
        height="full"
      >
        <Box>
          <Circle
            size={24}
            bg="primaryExtraDark.500"
            color="primary.500"
            my={2}
            mx="auto"
          >
            <AlertIcon fontSize={40} />
          </Circle>
          <Flex my={2} alignItems="center" mb={8} direction="column">
            <H3 color={"white"} mb={3}>
              Account deprecated
            </H3>

            <P3 color="neutrals.200" textAlign="center">
              This is a deprecated account that can’t be upgraded or used any
              longer. Please contact StarkNet for more information
            </P3>
          </Flex>
          <B3
            display="flex"
            color="neutrals.400"
            alignItems="center"
            justifyContent="center"
            as="a"
            href="https://starknet.io/discord/"
            title="StarkNet discord"
            target="_blank"
            _hover={{
              textDecoration: "underline",
            }}
          >
            Contact StarkNet
            <Text ml="1">
              <ExpandIcon />
            </Text>
          </B3>
        </Box>
        <Button onClick={navigateToHiddenAccounts} colorScheme="primary" px={2}>
          Hide account
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
