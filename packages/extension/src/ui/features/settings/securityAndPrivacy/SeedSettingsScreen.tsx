import {
  BarBackButton,
  Button,
  CellStack,
  HeaderCell,
  NavigationContainer,
} from "@argent/ui"
import { FC, ReactEventHandler } from "react"
import { Flex } from "@chakra-ui/react"

import { PasswordForm, PasswordFormProps } from "../../lock/PasswordForm"
import { SeedPhraseWithCopyButton } from "../../recovery/SeedPhraseWithCopyButton"
import { useSeedPhrase } from "../../recovery/hooks/useSeedPhrase"
import { WarningRecoveryBanner } from "../ui/WarningRecoveryBanner"

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
        <Flex px={4}>
          <SeedPhraseWithCopyButtonContainer />
        </Flex>
      ) : (
        <UnlockCopySeed verifyPassword={verifyPassword} />
      )}
    </NavigationContainer>
  )
}

function SeedPhraseWithCopyButtonContainer() {
  const seedPhrase = useSeedPhrase()
  return <SeedPhraseWithCopyButton seedPhrase={seedPhrase} />
}

function UnlockCopySeed({
  verifyPassword,
}: Pick<PasswordFormProps, "verifyPassword">) {
  return (
    <CellStack flex={1}>
      <WarningRecoveryBanner
        title="Never share your recovery phrase!"
        reasons={[
          "It’s the only way to recover your wallet",
          "If someone else has access to your recovery phrase they can control your wallet",
        ]}
        mb={4}
      />
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
