import {
  BarBackButton,
  Button,
  Empty,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ARGENT_SHIELD_NETWORK_ID } from "../../../shared/shield/constants"
import { resetDevice } from "../../../shared/shield/jwt"
import {
  requestEmail,
  shieldIsTokenExpired,
} from "../../../shared/shield/register"
import { getVerifiedEmailIsExpiredForRemoval } from "../../../shared/shield/verifiedEmail"
import { routes } from "../../routes"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { ShieldAccountActivate } from "./ShieldAccountActivate"
import { ShieldAccountDeactivate } from "./ShieldAccountDeactivate"
import { ShieldAccountNotReady } from "./ShieldAccountNotDeployed"
import { useRouteAccount } from "./useRouteAccount"
import { useShieldOnboardingTracking } from "./useShieldTracking"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

const { ArgentShieldIcon } = icons

export const ShieldAccountStartScreen: FC = () => {
  const navigate = useNavigate()
  const verifiedEmail = useShieldVerifiedEmail()
  const account = useRouteAccount()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const network = useCurrentNetwork()
  const { needsUpgrade = false } = useCheckUpgradeAvailable(account)

  const { trackSuccess } = useShieldOnboardingTracking({
    stepId: "welcome",
  })

  const onActivate = useCallback(async () => {
    void trackSuccess()
    if (verifiedEmail) {
      try {
        setIsLoading(true)
        const isExpired = account?.guardian
          ? await getVerifiedEmailIsExpiredForRemoval()
          : await shieldIsTokenExpired()
        if (isExpired) {
          await resetDevice()
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
  }, [
    account?.address,
    account?.guardian,
    navigate,
    toast,
    trackSuccess,
    verifiedEmail,
  ])

  const isAvailable = network.id === ARGENT_SHIELD_NETWORK_ID

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Argent Shield"}>
      {isAvailable ? (
        account?.needsDeploy ? (
          <ShieldAccountNotReady />
        ) : needsUpgrade ? (
          <ShieldAccountNotReady needsUpgrade />
        ) : (
          <Flex flexDirection={"column"} flex={1} px={4} pb={4}>
            {account?.guardian ? (
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
              Next
            </Button>
          </Flex>
        )
      ) : (
        <Empty
          icon={<ArgentShieldIcon />}
          title={"Argent Shield is not enabled for this network"}
        />
      )}
    </NavigationContainer>
  )
}
