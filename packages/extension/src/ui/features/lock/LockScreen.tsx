import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, H2, P3, P4, logosDeprecated } from "@argent/x-ui"
import { Box, Flex, FlexProps, Text } from "@chakra-ui/react"

import { routes } from "../../../shared/ui/routes"
import { sessionService } from "../../services/session"
import { PasswordForm } from "./PasswordForm"
import { useResetAll } from "../../hooks/useResetAll"
import { IS_DEV } from "../../../shared/utils/dev"

const { ArgentXLogo } = logosDeprecated

export const LockScreen: FC<FlexProps> = (props) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const resetAll = useResetAll()
  const handleVerifyPassword = async (password: string) => {
    setIsLoading(true)
    try {
      await sessionService.startSession(password)
      return true
    } catch {
      setError("Incorrect password")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetClick = () => {
    if (IS_DEV) {
      resetAll(true)
    } else {
      navigate(routes.reset())
    }
  }

  return (
    <Flex flex={1} flexDirection={"column"} py={6} px={5} {...props}>
      <Flex
        flex={1}
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        position="relative"
      >
        <P4
          onClick={handleResetClick}
          color="text-secondary"
          position="absolute"
          right={0}
          top={0}
          cursor="pointer"
        >
          Reset
        </P4>
        <Text pt={18} fontSize="10xl">
          <ArgentXLogo />
        </Text>
        <Box mt="8" mb="8" width="100%">
          <H2>Welcome back</H2>
          <P3 color="text-secondary">Unlock your wallet to continue</P3>
        </Box>

        <Box width="100%">
          <PasswordForm error={error} verifyPassword={handleVerifyPassword}>
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
