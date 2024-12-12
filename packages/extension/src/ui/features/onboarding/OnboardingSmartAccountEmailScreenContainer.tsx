import { voidify } from "@argent/x-shared"
import { useToast } from "@argent/x-ui"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { z } from "zod"

import { ampli } from "../../../shared/analytics"
import { resetDevice } from "../../../shared/smartAccount/jwt"
import { routes } from "../../../shared/ui/routes"
import { coerceErrorToString } from "../../../shared/utils/error"
import { clientArgentAccountService } from "../../services/argentAccount"
import type { emailSchema } from "../argentAccount/argentAccountBaseEmailScreen.model"
import { OnboardingSmartAccountEmailScreen } from "./OnboardingSmartAccountEmailScreen"

export const OnboardingSmartAccountEmailScreenContainer = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const onBack = useCallback(() => {
    ampli.onboardingEmailFlowAborted({
      "wallet platform": "browser extension",
    })
    navigate(routes.onboardingAccountType.path, { replace: true })
  }, [navigate])

  const onSubmit = useCallback(
    async ({ email }: z.infer<typeof emailSchema>) => {
      try {
        await resetDevice()
        await clientArgentAccountService.requestEmail(email)

        ampli.onboardingEmailEntered({
          "wallet platform": "browser extension",
        })

        navigate(routes.onboardingSmartAccountOTP(email))
      } catch (error) {
        console.warn(coerceErrorToString(error))
        toast({
          title: "Unable to verify email",
          status: "error",
          duration: 3000,
        })
      }
    },
    [navigate, toast],
  )

  return (
    <OnboardingSmartAccountEmailScreen
      onBack={onBack}
      onSubmit={voidify(onSubmit)}
    />
  )
}
