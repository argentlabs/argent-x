import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const MultisigOwnersButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(routes.multisigOwners(account.id))
  }

  return (
    <MultisigOwnersButton
      onClick={onClick}
      needsDeploy={!!account.needsDeploy}
    />
  )
}

interface MultisigOwnersButtonProps {
  onClick: () => void
  needsDeploy: boolean
}

export const MultisigOwnersButton: FC<MultisigOwnersButtonProps> = ({
  onClick,
  needsDeploy,
}) => {
  return (
    <ButtonCell onClick={onClick}>
      {needsDeploy ? <>View owners</> : <>Manage owners</>}
    </ButtonCell>
  )
}
