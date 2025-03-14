import { RadioEmptyIcon, SuccessPrimaryIcon } from "@argent/x-ui/icons"
import {
  BarCloseButton,
  CellStack,
  NavigationContainer,
  P3,
} from "@argent/x-ui"
import { Button, Flex } from "@chakra-ui/react"
import { useAtom } from "jotai"
import type { FC } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { sessionService } from "../../services/session"
import { PasswordWarningForm } from "../settings/ui/PasswordWarningForm"
import { SeedPhraseWithCopyButton } from "./SeedPhraseWithCopyButton"
import { hasSavedRecoverySeedphraseAtom } from "./hasSavedRecoverySeedphraseAtom"
import { useSeedPhrase } from "./hooks/useSeedPhrase"
import { voidify } from "@argent/x-shared"

export const SeedRecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const seedPhrase = useSeedPhrase()
  const [, setHasSavedRecoverySeedPhrase] = useAtom(
    hasSavedRecoverySeedphraseAtom,
  )
  const [isChecked, setIsChecked] = useState(false)
  const [passwordIsValid, setPasswordIsValid] = useState(false)

  const verifyPassword = async (password: string) => {
    const isValid = await sessionService.checkPassword(password)
    setPasswordIsValid(isValid)
    return isValid
  }

  const handleSubmit = async () => {
    void setHasSavedRecoverySeedPhrase(true)
    void navigate(routes.accountTokens())
  }
  return (
    <NavigationContainer
      title="Recovery phrase"
      rightButton={
        <BarCloseButton onClick={() => void navigate(routes.accountTokens())} />
      }
    >
      {passwordIsValid ? (
        <CellStack pt={0} flex={1}>
          <SeedPhraseWithCopyButton seedPhrase={seedPhrase} />
          <Flex flex={1}></Flex>
          <Button
            mb={2}
            size={"auto"}
            colorScheme="transparent"
            _active={{ bg: "transparent" }}
            _hover={{ bg: "transparent" }}
            whiteSpace={"initial"}
            leftIcon={
              isChecked ? (
                <SuccessPrimaryIcon
                  data-testid="recovery-phrase-checked"
                  fontSize={"4xl"}
                  color={"success.500"}
                />
              ) : (
                <RadioEmptyIcon fontSize={"4xl"} color={"neutrals.500"} />
              )
            }
            onClick={() => setIsChecked((prevChecked) => !prevChecked)}
          >
            <P3 textAlign={"left"} color="neutrals.300">
              I have saved my recovery phrase and understand I should never
              share it with anyone else
            </P3>
          </Button>
          <Button
            colorScheme="primary"
            isDisabled={!seedPhrase || !isChecked}
            onClick={voidify(handleSubmit)}
          >
            Done
          </Button>
        </CellStack>
      ) : (
        <PasswordWarningForm
          verifyPassword={verifyPassword}
          title="Never share your recovery phrase!"
          reasons={[
            "It’s the only way to recover your wallet",
            "If someone else has access to your recovery phrase they can control your wallet",
          ]}
          mb={4}
        />
      )}
    </NavigationContainer>
  )
}
