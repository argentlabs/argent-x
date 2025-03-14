import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const ConnectedDappButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.settingsAuthorizedDappsAccount(account.id))
  }

  return <ConnectedDappsButton onClick={onClick} />
}

interface ConnectedDappsButtonProps {
  onClick: () => void
}

export const ConnectedDappsButton: FC<ConnectedDappsButtonProps> = ({
  onClick,
}) => {
  return <ButtonCell onClick={onClick}>Connected dapps</ButtonCell>
}
