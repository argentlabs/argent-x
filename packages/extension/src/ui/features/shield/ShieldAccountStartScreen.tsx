import {
  BarBackButton,
  Button,
  Empty,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ARGENT_SHIELD_NETWORK_ID } from "../../../shared/shield/constants"
import { resetDevice } from "../../../shared/shield/jwt"
import { getVerifiedEmailIsExpiredForRemoval } from "../../../shared/shield/verifiedEmail"
import { routes } from "../../routes"
import { argentAccountService } from "../../services/argentAccount"
import { useCheckUpgradeAvailable } from "../accounts/accountUpgradeCheck"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { ShieldAccountActivate } from "./ShieldAccountActivate"
import { ShieldAccountDeactivate } from "./ShieldAccountDeactivate"
import { ShieldAccountNotReady } from "./ShieldAccountNotDeployed"
import { useRouteAccount } from "./useRouteAccount"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

const { ArgentShieldIcon } = icons

export const ShieldAccountStartScreen: FC = () => {
  const navigate = useNavigate()
  const verifiedEmail = useShieldVerifiedEmail()
  const account = useRouteAccount()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const network = useCurrentNetwork()
  const needsUpgrade = useCheckUpgradeAvailable(account)

  const onActivate = useCallback(async () => {
    if (verifiedEmail) {
      try {
        setIsLoading(true)
        const isExpired = account?.guardian
          ? await getVerifiedEmailIsExpiredForRemoval()
          : await argentAccountService.isTokenExpired()
        if (isExpired) {
          await resetDevice()
          await argentAccountService.requestEmail(verifiedEmail)
          if (account?.address) {
            navigate(
              routes.shieldAccountOTP(
                account?.address,
                verifiedEmail,
                "shield",
              ),
            )
          }
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
      navigate(routes.argentAccountEmail(account?.address, "shield"))
    }
  }, [account?.address, account?.guardian, navigate, toast, verifiedEmail])

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
              onClick={() => void onActivate()}
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
