import {
  BarBackButton,
  Button,
  CellStack,
  HeaderCell,
  NavigationContainer,
} from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { PasswordForm, PasswordFormProps } from "../../lock/PasswordForm"
import { CopySeedPhrase } from "../../recovery/CopySeedPhrase"
import { useSeedPhrase } from "../../recovery/hooks/useSeedPhrase"
import { SeedPhrase } from "../../recovery/SeedPhrase"
import { Divider, Flex, Text } from "@chakra-ui/react"
import { WarningRecoverySeedphraseBanner } from "../../accountTokens/WarningRecoverySeedphraseBanner"

export interface SeedSettingsScreenProps
  extends Pick<PasswordFormProps, "verifyPassword"> {
  onBack: ReactEventHandler
  passwordIsValid: boolean
}

export const SeedSettingsScreen: FC<SeedSettingsScreenProps> = ({
  onBack,
  passwordIsValid,
  verifyPassword,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Recovery phrase"}
    >
      {passwordIsValid ? (
        <CopySeedScreen />
      ) : (
        <UnlockCopySeed verifyPassword={verifyPassword} />
      )}
    </NavigationContainer>
  )
}

function CopySeedScreen() {
  const seedPhrase = useSeedPhrase()
  return (
    <CellStack>
      <Text fontSize="sm" color="neutrals.300" mb={2}>
        Write these words down on paper. It is unsafe to save them on your
        computer.
      </Text>
      <Divider mb={2} color="neutrals.800" />
      <SeedPhrase seedPhrase={seedPhrase} />
      <CopySeedPhrase seedPhrase={seedPhrase} />
    </CellStack>
  )
}

function UnlockCopySeed({
  verifyPassword,
}: Pick<PasswordFormProps, "verifyPassword">) {
  return (
    <CellStack flex={1}>
      <WarningRecoverySeedphraseBanner />
      <HeaderCell color={"text.primary"}>Enter your password</HeaderCell>
      <PasswordForm flex={1} verifyPassword={verifyPassword}>
        {(isDirty) => (
          <>
            <Flex flex={1}></Flex>
            <Button
              type="submit"
              disabled={!isDirty}
              colorScheme="primary"
              width="full"
            >
              Unlock
            </Button>
          </>
        )}
      </PasswordForm>
    </CellStack>
  )
}
