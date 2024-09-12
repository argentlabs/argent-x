import { ButtonCell } from "@argent/x-ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import { WalletAccount } from "../../../../../../shared/wallet.model"

export const ConnectedDappButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.settingsDappConnectionsAccount(account?.address))
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
