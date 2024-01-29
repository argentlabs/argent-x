import { Button, Warning } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../routes"

export const BeforeYouContinueScreen = () => {
  const navigate = useNavigate()
  const navigateToRecoveryPhrase = () => {
    navigate(routes.setupSeedRecovery())
  }
  return (
    <Flex py={4} px={5} direction={"column"} flex={1}>
      <Warning
        title="Before you continue..."
        subtitle="Please save your recovery phrase. This is the only way you will be able to recover your Argent X accounts"
      />
      <Button onClick={navigateToRecoveryPhrase} colorScheme="primary" px={2}>
        Next
      </Button>
    </Flex>
  )
}
