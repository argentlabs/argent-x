import type { FC } from "react"
import { useState } from "react"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { sessionService } from "../../../services/session"
import { ExportPrivateKeyScreen } from "./ExportPrivateKeyScreen"
import { useParams } from "react-router-dom"

export const ExportPrivateKeyScreenContainer: FC = () => {
  const { type = "export" } = useParams<{ type: "export" | "reveal" }>()
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
      type={type}
    />
  )
}
