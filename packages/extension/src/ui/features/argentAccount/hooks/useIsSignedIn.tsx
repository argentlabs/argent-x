import { useShieldVerifiedEmail } from "../../shield/useShieldVerifiedEmail"
import { useArgentAccountTokenExpired } from "./useArgentAccountTokenExpired"

export const useIsSignedIn = () => {
  const verifiedEmail = useShieldVerifiedEmail()
  const { data: isArgentAccountTokenExpired } = useArgentAccountTokenExpired()
  const isSignedIn = Boolean(verifiedEmail && !isArgentAccountTokenExpired)
  return isSignedIn
}
