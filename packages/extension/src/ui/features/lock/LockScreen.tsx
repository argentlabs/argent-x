import { Button, H2, P3, P4, logos } from "@argent/ui"
import { Box, Flex, Text } from "@chakra-ui/react"
import { FC, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { unlockedExtensionTracking } from "../../services/analytics"
import { startSession } from "../../services/backgroundSessions"
import { useActions } from "../actions/actions.state"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { recover } from "../recovery/recovery.service"
import { PasswordForm } from "./PasswordForm"

const { ArgentXLogo } = logos

export const LockScreen: FC = () => {
  const navigate = useNavigate()
  const actions = useActions()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  return (
    <Flex flex={1} flexDirection={"column"} py={6} px={5}>
      <Flex
        flex={1}
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        position="relative"
      >
        <P4
          as={Link}
          to={routes.reset()}
          color="neutrals.300"
          position="absolute"
          right={0}
          top={0}
        >
          Reset
        </P4>
        <Text pt={18} fontSize="10xl">
          <ArgentXLogo />
        </Text>
        <Box mt="8" mb="8" width="100%">
          <H2>Welcome back</H2>
          <P3 color="neutrals.300">Unlock your wallet to continue</P3>
        </Box>

        <Box width="100%">
          <PasswordForm
            verifyPassword={async (password) => {
              setIsLoading(true)
              try {
                await startSession(password)
                unlockedExtensionTracking()
                const target = await recover()

                // If only called by dapp (in popup) because the wallet was locked, but the dapp is already whitelisted/no transactions requested (actions=0), then close
                if (EXTENSION_IS_POPUP && !actions.length) {
                  window.close()
                }

                navigate(target, { replace: true })
                return true
              } catch {
                useAppState.setState({
                  error: "Incorrect password",
                })
                return false
              } finally {
                setIsLoading(false)
              }
            }}
          >
            {({ isDirty, isSubmitting }) => (
              <Flex position={"absolute"} left={0} bottom={0} right={0}>
                <Button
                  gap="2"
                  colorScheme="primary"
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Unlocking"
                >
                  Unlock
                </Button>
              </Flex>
            )}
          </PasswordForm>
        </Box>
      </Flex>
    </Flex>
  )
}
