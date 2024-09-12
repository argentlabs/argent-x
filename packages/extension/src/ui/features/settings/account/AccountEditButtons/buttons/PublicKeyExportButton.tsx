import { ButtonCell } from "@argent/x-ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import { WalletAccount } from "../../../../../../shared/wallet.model"

export const PublicKeyExportButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.exportPublicKey(account.address))
  }

  return <PublicKeyExportButton onClick={onClick} />
}

interface PublicKeyExportButtonProps {
  onClick: () => void
}

export const PublicKeyExportButton: FC<PublicKeyExportButtonProps> = ({
  onClick,
}) => {
  return <ButtonCell onClick={onClick}>Export public key</ButtonCell>
}
