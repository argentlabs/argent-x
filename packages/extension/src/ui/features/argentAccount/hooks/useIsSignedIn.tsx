import { useSmartAccountVerifiedEmail } from "../../smartAccount/useSmartAccountVerifiedEmail"
import { useArgentAccountTokenExpired } from "./useArgentAccountTokenExpired"

export const useIsSignedIn = (extra: { initiator: string }) => {
  const verifiedEmail = useSmartAccountVerifiedEmail()
  const { data: isArgentAccountTokenExpired } = useArgentAccountTokenExpired(
    verifiedEmail,
    extra,
  )
  const isSignedIn = verifiedEmail ? !isArgentAccountTokenExpired : false
  return isSignedIn
}
