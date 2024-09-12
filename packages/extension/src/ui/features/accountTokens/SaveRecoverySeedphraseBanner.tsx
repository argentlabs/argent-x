import { H6, P4, iconsDeprecated } from "@argent/x-ui"
import { Button, Center, Circle } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"

const { PasswordIcon } = iconsDeprecated

export const SaveRecoverySeedphraseBanner: FC = () => {
  const navigate = useNavigate()
  const navigateToRecoveryPhrase = () => {
    navigate(routes.setupSeedRecovery())
  }
  return (
    <Center
      py={6}
      px={4}
      flexDirection={"column"}
      backgroundColor="surface-info-default"
      justifyContent={"center"}
      alignContent={"center"}
      textAlign="center"
      borderRadius="2xl"
    >
      <Circle bg={"secondary.sky.blue"} color={"neutrals.900"} size={12} mb={4}>
        <PasswordIcon fontSize={"3xl"} />
      </Circle>
      <H6>Save your recovery phrase</H6>
      <P4 color="white.50" mb={6} fontWeight="semibold">
        It is very important you save this as it’s the only way you can recover
        your account
      </P4>
      <Button
        onClick={navigateToRecoveryPhrase}
        backgroundColor="accent.500"
        _hover={{ bg: "accent.600" }}
        px={2}
        w={"full"}
        size={"sm"}
      >
        Show recovery phrase
      </Button>
    </Center>
  )
}
