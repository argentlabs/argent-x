import {
  BarBackButton,
  Button,
  CellStack,
  NavigationContainer,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"
import { ShieldHeader } from "./ShieldHeader"
import {
  ChangeGuardian,
  usePendingChangeGuardian,
} from "./usePendingChangingGuardian"
import { useRouteAccount } from "./useRouteAccount"

export const ShieldAccountFinishScreen: FC = () => {
  const account = useRouteAccount()
  const pendingChangeGuardian = usePendingChangeGuardian(account)

  const title = pendingChangeGuardian
    ? `${
        pendingChangeGuardian === ChangeGuardian.ADDING
          ? "Activating"
          : "Deactivating"
      } Argent Shield`
    : `Argent Shield ${account?.guardian ? "Activated" : "Deactivated"}`

  const subtitle = pendingChangeGuardian
    ? `Your account will ${
        pendingChangeGuardian === ChangeGuardian.ADDING ? "be" : "no longer be"
      } protected by Argent Shield`
    : `Your account is ${
        account?.guardian ? "now" : "no longer"
      } protected by Argent Shield`

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Argent Shield"}>
      <CellStack flex={1}>
        <ShieldHeader title={title} subtitle={subtitle} />
        <Flex flex={1} />
        <Button as={Link} to={routes.accountActivity()} colorScheme={"primary"}>
          Done
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
