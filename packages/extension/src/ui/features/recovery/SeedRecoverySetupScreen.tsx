import { BarCloseButton, NavigationContainer, icons } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { CopySeedPhrase } from "./CopySeedPhrase"
import { useSeedPhrase } from "./hooks/useSeedPhrase"
import { SeedPhrase } from "./SeedPhrase"
import { Flex, FormLabel, useCheckbox, Text, Divider } from "@chakra-ui/react"
import { useAtom } from "jotai"
import { hasSavedRecoverySeedphraseAtom } from "./hasSavedRecoverySeedphraseAtom"

const { CheckboxDefaultIcon, CheckboxActiveIcon } = icons

export const SeedRecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const seedPhrase = useSeedPhrase()
  const [, setHasSavedRecoverySeedPhrase] = useAtom(
    hasSavedRecoverySeedphraseAtom,
  )
  const { state, getCheckboxProps, getInputProps } = useCheckbox()
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
      <ConfirmScreen
        title="Recovery phrase"
        singleButton
        confirmButtonText="Done"
        confirmButtonDisabled={!seedPhrase || !state.isChecked}
        onSubmit={handleSubmit}
      >
        <Text fontSize="sm" color="neutrals.300" mb={2}>
          Write these words down on paper. It is unsafe to save them on your
          computer.
        </Text>
        <Divider mb={2} color="neutrals.800" />

        <SeedPhrase seedPhrase={seedPhrase} />

        <CopySeedPhrase seedPhrase={seedPhrase} />
        <FormLabel
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          width={"full"}
          gap={1}
          px={1}
          py={1}
          mt={3}
          cursor={"pointer"}
          _active={{ transform: "scale(0.975)" }}
          transitionProperty={"common"}
          transitionDuration={"fast"}
        >
          <input {...getInputProps()} hidden />
          <Flex {...getCheckboxProps()} fontSize={"4xl"}>
            {state.isChecked ? (
              <CheckboxActiveIcon color={"success.500"} />
            ) : (
              <CheckboxDefaultIcon color={"neutrals.500"} />
            )}
          </Flex>
          <Text fontSize={13} color="neutrals.300">
            {" "}
            I have saved my recovery phrase and understand I should never share
            it with anyone else
          </Text>
        </FormLabel>
      </ConfirmScreen>
    </NavigationContainer>
  )
}
