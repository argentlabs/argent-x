import { BroomIcon } from "@argent/x-ui/icons"
import { BarBackButton, H2, NavigationContainer, P2 } from "@argent/x-ui"
import { Button, Center, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { IconWrapper } from "../../../actions/transactionV2/header/icon"
import { PasswordForm } from "../../../lock/PasswordForm"
import { useClearLocalStorage } from "./useClearLocalStorage"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../shared/ui/routes"

export const ClearLocalStorageScreen: FC = () => {
  const navigate = useNavigate()
  const { verifyPasswordAndClearStorage } = useClearLocalStorage(() =>
    navigate(routes.accountTokens()),
  )
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Clear local storage"}
    >
      <Flex
        flex={1}
        flexDirection={"column"}
        py={6}
        px={5}
        justifyContent="space-between"
        alignItems="center"
        textAlign="center"
      >
        <Center py={8}>
          <IconWrapper background="black" w="24" h="24">
            <BroomIcon w="14" h="14" />
          </IconWrapper>
        </Center>
        <H2>Clear local storage</H2>
        <P2 mt={3} mb={6} color="text-secondary">
          Clearing the local storage can help to return Argent X back to a
          consistent state. Your settings and preferences will be reset but your
          accounts won’t be affected
        </P2>
        <PasswordForm
          w="full"
          flex={1}
          verifyPassword={verifyPasswordAndClearStorage}
          justifyContent="space-between"
        >
          {(isDirty) => (
            <>
              <Flex flex={1} />
              <Button
                gap="2"
                colorScheme="primary"
                type="submit"
                loadingText="Clear"
                disabled={!isDirty}
              >
                Clear
              </Button>
            </>
          )}
        </PasswordForm>
      </Flex>
    </NavigationContainer>
  )
}
