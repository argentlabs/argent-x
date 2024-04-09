import { BarBackButton, NavigationContainer } from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"
import { Flex } from "@chakra-ui/react"

import { PasswordFormProps } from "../../lock/PasswordForm"
import { SeedPhraseWithCopyButton } from "../../recovery/SeedPhraseWithCopyButton"
import { useSeedPhrase } from "../../recovery/hooks/useSeedPhrase"
import { PasswordWarningForm } from "../ui/PasswordWarningForm"

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

function SeedPhraseWithCopyButtonContainer() {
  const seedPhrase = useSeedPhrase()
  return <SeedPhraseWithCopyButton seedPhrase={seedPhrase} />
}
