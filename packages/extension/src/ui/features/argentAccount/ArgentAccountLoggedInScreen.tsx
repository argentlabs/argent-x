import {
  BarCloseButton,
  H5,
  icons,
  Input,
  NavigationContainer,
} from "@argent/x-ui"
import type { FC } from "react"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { ArgentAccountFeaturesList } from "./ArgentAccountFeaturesList"

const { LogOutIcon } = icons

type ArgentAccountLoggedInScreenProps = {
  handleClose: () => void
  handleLogout: () => Promise<void>
  verifiedEmail: string
  accountsWithGuardianEnabled: { accountName: string }[]
}

export const ArgentAccountLoggedInScreen: FC<
  ArgentAccountLoggedInScreenProps
> = ({
  handleClose,
  handleLogout,
  verifiedEmail,
  accountsWithGuardianEnabled,
}) => {
  return (
    <>
      <NavigationContainer
        rightButton={<BarCloseButton onClick={handleClose} />}
        title={"Argent Account"}
      >
        <Flex direction="column" p={4}>
          <Input
            disabled={true}
            value={verifiedEmail}
            bgColor="neutrals.800"
            color="white"
            fontWeight={600}
          />
          <Divider color="neutrals.700" mt={4} mb={5} />
          <H5 color="neutrals.300" mx={2}>
            Your email will be used for the following features if you choose to
            enable them:
          </H5>
          <Box my={5}>
            <ArgentAccountFeaturesList
              accountsWithGuardianEnabled={accountsWithGuardianEnabled}
              isLoggedIn={true}
            />
          </Box>
        </Flex>
      </NavigationContainer>
      <Divider color="neutrals.700" />
      <Flex justifyContent="center" alignItems="center" mb={1}>
        <Button
          variant="ghost"
          size="lg"
          color="neutrals.300"
          display="flex"
          alignItems="center"
          _hover={{ color: "error.500" }}
          onClick={() => void handleLogout()}
        >
          <LogOutIcon />
          &nbsp; Logout
        </Button>
      </Flex>
    </>
  )
}
