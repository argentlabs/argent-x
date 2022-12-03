import { Navigate } from "../../components/Navigate"
import { useBackendAccount } from "../../hooks/account"

export default function ForgotPasswordFinish() {
  const { account } = useBackendAccount()

  if (account) {
    return (
      <Navigate to={`/new-password?flow=forgotPassword`} as="/new-password" />
    )
  }
}
