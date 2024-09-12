import { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { FundingQrCodeScreen } from "./FundingQrCodeScreen"

export const FundingQrCodeScreenContainer: FC = () => {
  const navigate = useNavigate()
  const account = useView(selectedAccountView)

  const onClose = () => navigate(routes.accountTokens())

  if (!account) {
    return <Navigate to={routes.accountTokens()} />
  }

  return (
    <FundingQrCodeScreen
      onClose={onClose}
      accountName={account.name}
      accountAddress={account.address}
    />
  )
}
