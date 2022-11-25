import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { ShieldBaseEmailScreen } from "./ShieldBaseEmailScreen"

export const ShieldActionEmailScreen: FC = () => {
  const navigate = useNavigate()

  const onEmailRequested = useCallback(
    (email: string) => {
      navigate(routes.shieldActionOTP(email))
    },
    [navigate],
  )

  return <ShieldBaseEmailScreen onEmailRequested={onEmailRequested} />
}
