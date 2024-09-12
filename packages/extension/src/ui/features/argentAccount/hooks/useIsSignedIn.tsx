import { useSmartAccountVerifiedEmail } from "../../smartAccount/useSmartAccountVerifiedEmail"
import { useArgentAccountTokenExpired } from "./useArgentAccountTokenExpired"

export const useIsSignedIn = () => {
  const verifiedEmail = useSmartAccountVerifiedEmail()
  const { data: isArgentAccountTokenExpired } =
    useArgentAccountTokenExpired(verifiedEmail)
  const isSignedIn = verifiedEmail ? !isArgentAccountTokenExpired : false
  return isSignedIn
}
