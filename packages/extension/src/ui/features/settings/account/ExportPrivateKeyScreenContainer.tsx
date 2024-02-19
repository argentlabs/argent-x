import { FC, useState } from "react"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { sessionService } from "../../../services/session"
import { ExportPrivateKeyScreen } from "./ExportPrivateKeyScreen"

export const ExportPrivateKeyScreenContainer: FC = () => {
  const [passwordIsValid, setPasswordIsValid] = useState(false)
  const onBack = useNavigateReturnToOrBack()
  const verifyPassword = async (password: string) => {
    const isValid = await sessionService.checkPassword(password)
    setPasswordIsValid(isValid)
    return isValid
  }
  return (
    <ExportPrivateKeyScreen
      onBack={onBack}
      passwordIsValid={passwordIsValid}
      verifyPassword={verifyPassword}
    />
  )
}
