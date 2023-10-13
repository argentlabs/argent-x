import { P4, icons, Button, NavigationContainer, H3 } from "@argent/ui"
import { Box, Circle, Flex } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

const { AlertIcon } = icons

export const BeforeYouContinueScreen = () => {
  const navigate = useNavigate()
  const navigateToRecoveryPhrase = () => {
    navigate(routes.setupSeedRecovery())
  }
  return (
    <NavigationContainer>
      <Flex
        py={4}
        px={5}
        direction={"column"}
        justifyContent={"space-between"}
        alignContent={"center"}
        borderRadius="2xl"
        width="full"
        height="full"
      >
        <Box>
          <Circle
            size={24}
            bg={"primaryExtraDark.500"}
            color={"primary.500"}
            my={2}
            mx="auto"
          >
            <AlertIcon fontSize={40} />
          </Circle>
          <Flex my={2} alignItems="center" mb={4} direction="column">
            <H3 color={"white"} mb={3}>
              Before you continue...
            </H3>

            <P4 fontSize={16} color={"neutrals.100"} textAlign="center">
              Please save your recovery phrase. This is the only way you will be
              able to recover your Argent X accounts
            </P4>
          </Flex>
        </Box>
        <Button onClick={navigateToRecoveryPhrase} colorScheme="primary" px={2}>
          Next
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
