import {
  BarBackButton,
  Button,
  CellStack,
  NavigationContainer,
} from "@argent/ui"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useReturnTo } from "../../routes"
import { StickyGroup } from "../actions/DeprecatedConfirmScreen"
import { PasswordForm } from "../lock/PasswordForm"
import { CopySeedPhrase } from "../recovery/CopySeedPhrase"
import { useSeedPhrase } from "../recovery/hooks/useSeedPhrase"
import { SeedPhrase } from "../recovery/SeedPhrase"
import { Divider, Text } from "@chakra-ui/react"
import { WarningRecoverySeedphraseBanner } from "../accountTokens/WarningRecoverySeedphraseBanner"
import { sessionService } from "../../services/session"

const CopySeedScreen: FC = () => {
  const seedPhrase = useSeedPhrase()
  return (
    <>
      <Text fontSize="sm" color="neutrals.300" mb={2}>
        Write these words down on paper. It is unsafe to save them on your
        computer.
      </Text>
      <Divider mb={2} color="neutrals.800" />

      <SeedPhrase seedPhrase={seedPhrase} />
      <CopySeedPhrase seedPhrase={seedPhrase} />
    </>
  )
}

const UnlockCopySeed: FC<{
  setPasswordIsValid: (isValid: boolean) => void
}> = ({ setPasswordIsValid }) => {
  const verifyPassword = async (password: string) => {
    const isValid = await sessionService.checkPassword(password)
    setPasswordIsValid(isValid)
    return isValid
  }
  return (
    <>
      <WarningRecoverySeedphraseBanner />
      <Text fontSize={16} fontWeight="bold" ml={2}>
        Enter your password
      </Text>

      <PasswordForm verifyPassword={verifyPassword}>
        {(isDirty) => (
          <StickyGroup>
            <Button
              type="submit"
              disabled={!isDirty}
              colorScheme="primary"
              width="full"
            >
              Unlock
            </Button>
          </StickyGroup>
        )}
      </PasswordForm>
    </>
  )
}

export const SeedSettingsScreen: FC = () => {
  const [passwordIsValid, setPasswordIsValid] = useState(false)
  const returnTo = useReturnTo()
  const navigate = useNavigate()

  const onClick = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onClick} />}
      title={"Recovery phrase"}
    >
      <CellStack>
        {!passwordIsValid && (
          <UnlockCopySeed setPasswordIsValid={setPasswordIsValid} />
        )}
        {passwordIsValid && <CopySeedScreen />}
      </CellStack>
    </NavigationContainer>
  )
}
