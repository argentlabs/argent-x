import { ButtonCell } from "@argent/x-ui"
import { FC, useMemo } from "react"
import { useHasFeeTokenBalance } from "../../../../accountTokens/useFeeTokenBalance"
import { clientAccountService } from "../../../../../services/account"
import { WalletAccount } from "../../../../../../shared/wallet.model"

export const DeployAccountButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const hasFeeTokenBalance = useHasFeeTokenBalance(account)
  const canDeployAccount = useMemo(
    () => account.needsDeploy && hasFeeTokenBalance,
    [account?.needsDeploy, hasFeeTokenBalance],
  )
  const onDeploy = () => clientAccountService.deploy(account)

  if (!canDeployAccount) {
    return null
  }

  return <DeployAccountButton onDeploy={onDeploy} />
}

interface DeployAccountButtonProps {
  onDeploy: () => void
}

export const DeployAccountButton: FC<DeployAccountButtonProps> = ({
  onDeploy,
}) => {
  return <ButtonCell onClick={onDeploy}>Deploy account</ButtonCell>
}
