import { H5, icons, P3Bold } from "@argent/x-ui"
import type { CenterProps } from "@chakra-ui/react"
import { Button, Center, Circle } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { needsToSaveRecoverySeedphraseView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"

const { PasscodePrimaryIcon } = icons

export const useShowSaveRecoverySeedphraseBanner = () => {
  const needsToSaveRecoverySeedphrase = useView(
    needsToSaveRecoverySeedphraseView,
  )
  const isMainnet = useIsMainnet()
  return needsToSaveRecoverySeedphrase && isMainnet
}

export const SaveRecoverySeedphraseBanner: FC<CenterProps> = (props) => {
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
      {...props}
    >
      <Circle
        bg={"surface-info-vibrant"}
        color={"surface-default"}
        size={12}
        mb={4}
      >
        <PasscodePrimaryIcon fontSize={"3xl"} />
      </Circle>
      <H5>Save your recovery phrase</H5>
      <P3Bold color="white.50" mb={6}>
        It is very important you save this as it’s the only way you can recover
        your account
      </P3Bold>
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
