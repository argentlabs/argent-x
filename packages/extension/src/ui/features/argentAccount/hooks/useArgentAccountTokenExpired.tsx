import useSWR from "swr"
import { clientArgentAccountService } from "../../../services/argentAccount"

export const useArgentAccountTokenExpired = (
  verifiedEmail: string | null | undefined,
) =>
  useSWR(
    verifiedEmail ? ["tokenExpired", verifiedEmail] : null,
    () => clientArgentAccountService.isTokenExpired(),
    {
      revalidateOnMount: false,
    },
  )
