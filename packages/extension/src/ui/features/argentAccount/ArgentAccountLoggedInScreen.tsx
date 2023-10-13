import {
  icons,
  NavigationContainer,
  BarCloseButton,
  Input,
  H6,
} from "@argent/ui"
import { FC } from "react"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { ArgentAccountFeaturesList } from "./ArgentAccountFeaturesList"

const { LogoutIcon } = icons

type ArgentAccountLoggedInScreenProps = {
  handleClose: () => void
  handleLogout: () => Promise<void>
  verifiedEmail: string
  isEmailNotificationsEnabled: boolean
  accountsWithShieldEnabled: { accountName: string }[]
}

export const ArgentAccountLoggedInScreen: FC<
  ArgentAccountLoggedInScreenProps
> = ({
  handleClose,
  handleLogout,
  verifiedEmail,
  isEmailNotificationsEnabled,
  accountsWithShieldEnabled,
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
          />
          <Divider color="neutrals.700" my={3} />
          <H6 color="neutrals.300" mx={2}>
            Your email will be used for the following features if you choose to
            enable them:
          </H6>
          <Box my={4}>
            <ArgentAccountFeaturesList
              isEmailNotificationsEnabled={isEmailNotificationsEnabled}
              accountsWithShieldEnabled={accountsWithShieldEnabled}
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
          onClick={handleLogout}
        >
          <LogoutIcon />
          &nbsp; Logout
        </Button>
      </Flex>
    </>
  )
}
