import {
  BarBackButton,
  Button,
  CellStack,
  NavigationContainer,
  useToast,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { constants } from "starknet"

import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { routes } from "../../routes"
import { accountChangeGuardian } from "../../services/backgroundAccounts"
import { shieldMaybeAddAccount } from "../../services/shieldAccount"
import { ShieldHeader } from "./ShieldHeader"
import { usePendingChangeGuardian } from "./usePendingChangingGuardian"
import { useRouteAccount } from "./useRouteAccount"

export const ShieldAccountActionScreen: FC = () => {
  const account = useRouteAccount()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const pendingChangeGuardian = usePendingChangeGuardian(account)
  const toast = useToast()

  useEffect(() => {
    if (pendingChangeGuardian && account) {
      /** a guardian transaction for this account is now pending - move to finish */
      navigate(routes.shieldAccountFinish(account?.address), { replace: true })
    }
  }, [account, navigate, pendingChangeGuardian])

  const onAddOrRemove = useCallback(async () => {
    if (!account) {
      console.error("Cannot add or remove - no account")
      return
    }
    setIsLoading(true)
    try {
      // always check the account exists in backend
      const { guardianAddress } = await shieldMaybeAddAccount()
      if (account.guardian) {
        // remove
        await accountChangeGuardian(account, constants.ZERO.toString())
      } else {
        // add
        await accountChangeGuardian(account, guardianAddress)
      }
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to modify account",
        status: "error",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [account, toast])

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Argent Shield"}>
      <CellStack flex={1}>
        <ShieldHeader
          title={`3 - ${account?.guardian ? "Remove" : "Add"} Argent Shield`}
          subtitle={`You need to approve a transaction in order to ${
            account?.guardian
              ? "remove Argent Shield from"
              : "add Argent Shield to"
          } your account`}
        />
        <Flex flex={1} />
        <Button
          onClick={onAddOrRemove}
          colorScheme={"primary"}
          isLoading={isLoading}
          loadingText={`${
            account?.guardian ? "Removing" : "Adding"
          } Argent Shield`}
        >
          {account?.guardian ? "Remove" : "Add"} Argent Shield
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
