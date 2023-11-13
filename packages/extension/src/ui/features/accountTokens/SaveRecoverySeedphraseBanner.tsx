import { H6, P4, icons } from "@argent/ui"
import { Circle, Flex, Button } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

const { PasswordIcon } = icons

export const SaveRecoverySeedphraseBanner: FC = () => {
  const navigate = useNavigate()
  const navigateToRecoveryPhrase = () => {
    navigate(routes.setupSeedRecovery())
  }
  return (
    <Flex
      py={4}
      px={4}
      direction={"column"}
      backgroundColor="accentExtraDark"
      justifyContent={"center"}
      alignContent={"center"}
      borderRadius="2xl"
    >
      <Circle
        size={10}
        bg={"accentLight"}
        color={"neutrals.900"}
        my={2}
        mx="auto"
      >
        <PasswordIcon fontSize={24} />
      </Circle>
      <Flex my={2} alignItems="center" mb={4} direction="column">
        <H6 color={"white"}>Save your recovery phrase</H6>

        <P4 color={"neutrals.100"} textAlign="center">
          It is very important you save this as it’s the only way you can
          recover your account{" "}
        </P4>
      </Flex>
      <Button
        onClick={navigateToRecoveryPhrase}
        backgroundColor="accent.500"
        _hover={{ bg: "accent.600" }}
        px={2}
      >
        Show recovery phrase
      </Button>
    </Flex>
  )
}
