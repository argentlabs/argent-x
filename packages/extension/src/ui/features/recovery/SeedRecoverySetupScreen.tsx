import {
  BarCloseButton,
  CellStack,
  NavigationContainer,
  P4,
  iconsDeprecated,
} from "@argent/x-ui"
import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAtom } from "jotai"
import { Button, Flex } from "@chakra-ui/react"

import { routes } from "../../../shared/ui/routes"
import { SeedPhraseWithCopyButton } from "./SeedPhraseWithCopyButton"
import { hasSavedRecoverySeedphraseAtom } from "./hasSavedRecoverySeedphraseAtom"
import { useSeedPhrase } from "./hooks/useSeedPhrase"

const { CheckboxDefaultIcon, CheckboxActiveIcon } = iconsDeprecated

export const SeedRecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const seedPhrase = useSeedPhrase()
  const [, setHasSavedRecoverySeedPhrase] = useAtom(
    hasSavedRecoverySeedphraseAtom,
  )
  const [isChecked, setIsChecked] = useState(false)
  const handleSubmit = async () => {
    setHasSavedRecoverySeedPhrase(true)
    navigate(routes.accountTokens())
  }
  return (
    <NavigationContainer
      title="Recovery phrase"
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      <CellStack pt={0} flex={1}>
        <SeedPhraseWithCopyButton seedPhrase={seedPhrase} />
        <Flex flex={1}></Flex>
        <Button
          mb={2}
          size={"auto"}
          colorScheme="transparent"
          _hover={{ bg: "transparent" }}
          whiteSpace={"initial"}
          leftIcon={
            isChecked ? (
              <CheckboxActiveIcon
                data-testid="recovery-phrase-checked"
                fontSize={"4xl"}
                color={"success.500"}
              />
            ) : (
              <CheckboxDefaultIcon fontSize={"4xl"} color={"neutrals.500"} />
            )
          }
          onClick={() => setIsChecked((prevChecked) => !prevChecked)}
        >
          <P4 textAlign={"left"} color="neutrals.300">
            I have saved my recovery phrase and understand I should never share
            it with anyone else
          </P4>
        </Button>
        <Button
          colorScheme="primary"
          isDisabled={!seedPhrase || !isChecked}
          onClick={handleSubmit}
        >
          Done
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
