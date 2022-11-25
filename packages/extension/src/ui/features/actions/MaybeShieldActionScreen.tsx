import { Skeleton, VStack } from "@chakra-ui/react"
import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { getVerifiedEmailIsExpired } from "../../../shared/shield/jwt"
import { requestEmail } from "../../../shared/shield/register"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useShieldVerifiedEmail } from "../shield/useShieldVerifiedEmail"
import { ActionScreen } from "./ActionScreen"

/** if the current account has a Guardian, check and handle the email / otp verification flow */

export const MaybeShieldActionScreen: FC = () => {
  const account = useSelectedAccount()
  const verifiedEmail = useShieldVerifiedEmail()
  const navigate = useNavigate()
  const hasGuardian = Boolean(account?.guardian)

  useEffect(() => {
    const init = async () => {
      if (hasGuardian && verifiedEmail !== null) {
        console.log({ verifiedEmail })
        if (!verifiedEmail) {
          // need to ask for and verify email
          navigate(routes.shieldActionEmail())
        } else {
          const verifiedEmailIsExpired = await getVerifiedEmailIsExpired()
          console.log({ verifiedEmailIsExpired })
          if (verifiedEmailIsExpired) {
            // need to re-verify existing email
            await requestEmail(verifiedEmail)
            navigate(routes.shieldActionOTP(verifiedEmail))
          }
        }
      }
    }
    init()
  }, [hasGuardian, navigate, verifiedEmail])

  if (hasGuardian && verifiedEmail === null) {
    /** still loading */
    return (
      <VStack pt={12} px={8} spacing={2} align="stretch">
        <Skeleton height="16" rounded={"xl"} />
        <Skeleton height="16" rounded={"xl"} />
        <Skeleton height="16" rounded={"xl"} />
      </VStack>
    )
  }

  return <ActionScreen />
}
