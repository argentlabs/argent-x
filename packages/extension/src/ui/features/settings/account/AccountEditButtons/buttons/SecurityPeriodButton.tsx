import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const SecurityPeriodButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(routes.settingsSecurityPeriod())
  }

  if (account?.type !== "smart" || account.needsDeploy) {
    return null
  }

  return <SecurityPeriodButton onClick={onClick} />
}

interface SecurityPeriodButtonProps {
  onClick: () => void
}

export const SecurityPeriodButton: FC<SecurityPeriodButtonProps> = ({
  onClick,
}) => {
  return <ButtonCell onClick={onClick}>Change security period</ButtonCell>
}
