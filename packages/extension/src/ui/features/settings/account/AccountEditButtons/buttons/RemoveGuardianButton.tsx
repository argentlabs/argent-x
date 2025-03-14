import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const RemoveGuardianButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.settingsRemoveGuardian())
  }

  if (account?.type !== "smart") {
    return null
  }

  return <RemoveGuardianButton onClick={onClick} />
}

interface RemoveGuardianButtonProps {
  onClick: () => void
}

export const RemoveGuardianButton: FC<RemoveGuardianButtonProps> = ({
  onClick,
}) => {
  return <ButtonCell onClick={onClick}>Remove guardian</ButtonCell>
}
