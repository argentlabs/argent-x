import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import { useMemo } from "react"
import { useHasNativeFeeTokenBalance } from "../../../../accountTokens/useFeeTokenBalance"
import { clientAccountService } from "../../../../../services/account"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const DeployAccountButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const hasFeeTokenBalance = useHasNativeFeeTokenBalance(account)
  const canDeployAccount = useMemo(
    () => account.needsDeploy && hasFeeTokenBalance,
    [account?.needsDeploy, hasFeeTokenBalance],
  )
  const onDeploy = () => clientAccountService.deploy(account)

  if (!canDeployAccount) {
    return null
  }

  return <DeployAccountButton onDeploy={() => void onDeploy()} />
}

interface DeployAccountButtonProps {
  onDeploy: () => void
}

export const DeployAccountButton: FC<DeployAccountButtonProps> = ({
  onDeploy,
}) => {
  return <ButtonCell onClick={onDeploy}>Deploy account</ButtonCell>
}
