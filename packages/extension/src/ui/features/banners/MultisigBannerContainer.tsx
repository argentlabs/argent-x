import type { FC } from "react"
import { useCallback } from "react"

import { useIsMultisigDeploying } from "../multisig/hooks/useIsMultisigDeploying"
import { clientAccountService } from "../../services/account"
import { MultisigBanner } from "./MultisigBanner"
import { multisigView } from "../multisig/multisig.state"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useHasNativeFeeTokenBalance } from "../accountTokens/useFeeTokenBalance"
import { useView } from "../../views/implementation/react"
import { voidify } from "@argent/x-shared"

interface MultisigBannerContainerProps {
  account: WalletAccount
}

export const useShowMultisigBanner = (account: WalletAccount) => {
  const multisig = useView(multisigView(account))
  const isMultisigDeploying = useIsMultisigDeploying(multisig)
  const hasFeeTokenBalance = useHasNativeFeeTokenBalance(account)

  const showActivateMultisigBanner = Boolean(
    !isMultisigDeploying && multisig?.needsDeploy && hasFeeTokenBalance,
  )

  return showActivateMultisigBanner || isMultisigDeploying
}

export const MultisigBannerContainer: FC<MultisigBannerContainerProps> = ({
  account,
}) => {
  const multisig = useView(multisigView(account))
  const isMultisigDeploying = useIsMultisigDeploying(multisig)
  const hasFeeTokenBalance = useHasNativeFeeTokenBalance(account)

  const showActivateMultisigBanner = Boolean(
    !isMultisigDeploying && multisig?.needsDeploy && hasFeeTokenBalance,
  )

  const onActivateMultisig = useCallback(async () => {
    if (multisig) {
      await clientAccountService.deploy(multisig)
    }
  }, [multisig])

  return (
    <MultisigBanner
      showActivateMultisigBanner={showActivateMultisigBanner}
      onActivateMultisig={voidify(onActivateMultisig)}
      isMultisigDeploying={isMultisigDeploying}
    />
  )
}
