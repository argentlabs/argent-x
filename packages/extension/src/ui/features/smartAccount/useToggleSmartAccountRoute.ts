import { useCallback, useState } from "react"
import { getVerifiedEmailIsExpiredForRemoval } from "../../../shared/smartAccount/verifiedEmail"
import { clientArgentAccountService } from "../../services/argentAccount"
import { resetDevice } from "../../../shared/smartAccount/jwt"
import { routes } from "../../../shared/ui/routes"
import { useToast } from "@argent/x-ui"
import { useSmartAccountVerifiedEmail } from "./useSmartAccountVerifiedEmail"
import { useNavigate } from "react-router-dom"
import { WalletAccount } from "../../../shared/wallet.model"

export const useToggleSmartAccountRoute = () => {
  const verifiedEmail = useSmartAccountVerifiedEmail()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const startToggleSmartAccountFlow = useCallback(
    async (account: WalletAccount | undefined) => {
      if (verifiedEmail) {
        try {
          setIsLoading(true)
          const isExpired = account?.guardian
            ? await getVerifiedEmailIsExpiredForRemoval()
            : await clientArgentAccountService.isTokenExpired()
          if (isExpired) {
            await resetDevice()
            await clientArgentAccountService.requestEmail(verifiedEmail)
            if (account?.address) {
              navigate(
                routes.smartAccountOTP(
                  account?.address,
                  verifiedEmail,
                  "toggleSmartAccount",
                ),
              )
            }
          } else {
            navigate(routes.smartAccountAction(account?.address))
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
        navigate(
          routes.argentAccountEmail(account?.address, "toggleSmartAccount"),
        )
      }
    },
    [navigate, toast, verifiedEmail],
  )

  return { isLoading, startToggleSmartAccountFlow }
}
