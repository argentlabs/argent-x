import { Button, H2, P3, P4 } from "@argent/ui"
import { Box, Spinner } from "@chakra-ui/react"
import { FC, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { unlockedExtensionTracking } from "../../services/analytics"
import { startSession } from "../../services/backgroundSessions"
import { useActions } from "../actions/actions.state"
import { StickyGroup } from "../actions/ConfirmScreen"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { recover } from "../recovery/recovery.service"
import LogoSvg from "./logo.svg"
import { PasswordForm } from "./PasswordForm"

export const LockScreen: FC = () => {
  const navigate = useNavigate()
  const actions = useActions()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      pt="24"
      pb="12"
      px="8"
      textAlign="center"
      position="relative"
    >
      <Box position="absolute" right="8" top="4">
        <Link to={routes.reset()}>
          <P4 color="neutrals.300">Reset</P4>
        </Link>
      </Box>
      <LogoSvg />
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

              navigate(target)
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
            <>
              <StickyGroup>
                <Button
                  gap="2"
                  colorScheme="primary"
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  width="100%"
                >
                  {isLoading && (
                    <>
                      <Spinner />
                      Unlocking
                    </>
                  )}
                  {!isLoading && "Unlock"}
                </Button>
              </StickyGroup>
            </>
          )}
        </PasswordForm>
      </Box>
    </Box>
  )
}
