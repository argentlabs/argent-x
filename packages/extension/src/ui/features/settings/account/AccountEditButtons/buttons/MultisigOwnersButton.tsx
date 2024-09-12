import { ButtonCell } from "@argent/x-ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import { WalletAccount } from "../../../../../../shared/wallet.model"

export const MultisigOwnersButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(routes.multisigOwners(account.address))
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
