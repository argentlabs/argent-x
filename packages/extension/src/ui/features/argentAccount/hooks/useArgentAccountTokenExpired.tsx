import useSWR from "swr"
import { clientArgentAccountService } from "../../../services/argentAccount"

export const useArgentAccountTokenExpired = (
  verifiedEmail: string | null | undefined,
  extra: { initiator: string },
) =>
  useSWR(
    verifiedEmail ? ["tokenExpired", verifiedEmail] : null,
    () => clientArgentAccountService.isTokenExpired(extra),
    {
      revalidateOnMount: false,
    },
  )
