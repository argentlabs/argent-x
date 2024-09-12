import { ButtonCell } from "@argent/x-ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import { WalletAccount } from "../../../../../../shared/wallet.model"

export const PrivateKeyExportButtonContainer: FC<{
  account: WalletAccount
}> = ({ account }) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.exportPrivateKey(account.address))
  }

  return <PrivateKeyExportButton onClick={onClick} />
}

interface PrivateKeyExportButtonProps {
  onClick: () => void
}

export const PrivateKeyExportButton: FC<PrivateKeyExportButtonProps> = ({
  onClick,
}) => {
  return (
    <ButtonCell colorScheme={"neutrals-danger"} onClick={onClick}>
      Export private key
    </ButtonCell>
  )
}
