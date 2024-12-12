import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../../shared/wallet.model"
import { upperFirst } from "lodash-es"

export const PrivateKeyExportButtonContainer: FC<{
  account: WalletAccount
  action?: "export" | "reveal"
}> = ({ account, action = "export" }) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.exportPrivateKey(account.id, action))
  }

  return (
    <PrivateKeyExportButton onClick={onClick} action={upperFirst(action)} />
  )
}

interface PrivateKeyExportButtonProps {
  onClick: () => void
  action: string
}

export const PrivateKeyExportButton: FC<PrivateKeyExportButtonProps> = ({
  onClick,
  action,
}) => {
  return (
    <ButtonCell colorScheme={"neutrals-danger"} onClick={onClick}>
      {action} private key
    </ButtonCell>
  )
}
