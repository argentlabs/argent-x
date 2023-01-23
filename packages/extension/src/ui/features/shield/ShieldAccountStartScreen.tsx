import {
  getVerifiedEmailIsExpired,
  getVerifiedEmailIsExpiredForRemoval,
} from "@argent/guardian"
import {
  BarBackButton,
  Button,
  CellStack,
  Empty,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { requestEmail } from "../../../shared/shield/register"
import { routes } from "../../routes"
import { useCurrentNetwork } from "../networks/useNetworks"
import { ShieldAccountActivate } from "./ShieldAccountActivate"
import { ShieldAccountDeactivate } from "./ShieldAccountDeactivate"
import { ShieldAccountNotDeployed } from "./ShieldAccountNotDeployed"
import { useRouteAccount } from "./useRouteAccount"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

const { ShieldIcon } = icons

export const ShieldAccountStartScreen: FC = () => {
  const navigate = useNavigate()
  const verifiedEmail = useShieldVerifiedEmail()
  const account = useRouteAccount()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const network = useCurrentNetwork()

  const onActivate = useCallback(async () => {
    if (verifiedEmail) {
      try {
        setIsLoading(true)
        const verifiedEmailIsExpired = account?.guardian
          ? await getVerifiedEmailIsExpiredForRemoval()
          : await getVerifiedEmailIsExpired()
        console.log({ verifiedEmailIsExpired })
        if (verifiedEmailIsExpired) {
          await requestEmail(verifiedEmail)
          navigate(routes.shieldAccountOTP(account?.address, verifiedEmail))
        } else {
          navigate(routes.shieldAccountAction(account?.address))
        }
      } catch {
        toast({
          title: "Unable to verify email",
          status: "error",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      navigate(routes.shieldAccountEmail(account?.address))
    }
  }, [account?.address, account?.guardian, navigate, toast, verifiedEmail])

  const isAvailable = network.id === "goerli-alpha-2"

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Argent Shield"}>
      {isAvailable ? (
        <CellStack flex={1}>
          {account?.needsDeploy ? (
            <ShieldAccountNotDeployed />
          ) : account?.guardian ? (
            <ShieldAccountDeactivate />
          ) : (
            <ShieldAccountActivate />
          )}
          <Flex flex={1} />
          <Button
            onClick={onActivate}
            colorScheme={"primary"}
            disabled={isLoading || account?.needsDeploy}
            isLoading={isLoading}
            loadingText={"Verifying email"}
          >
            {account?.guardian ? "Deactivate" : "Activate"}
          </Button>
        </CellStack>
      ) : (
        <Empty
          icon={<ShieldIcon />}
          title={"Argent Shield is currently available only on Testnet 2"}
        />
      )}
    </NavigationContainer>
  )
}
