import { FC, useState } from "react"
import { sessionService } from "../../../services/session"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { SeedSettingsScreen } from "./SeedSettingsScreen"

export const SeedSettingsScreenContainer: FC = () => {
  const [passwordIsValid, setPasswordIsValid] = useState(false)
  const onBack = useNavigateReturnToOrBack()
  const verifyPassword = async (password: string) => {
    const isValid = await sessionService.checkPassword(password)
    setPasswordIsValid(isValid)
    return isValid
  }
  return (
    <SeedSettingsScreen
      onBack={onBack}
      passwordIsValid={passwordIsValid}
      verifyPassword={verifyPassword}
    />
  )
}
