import { AlertButton } from "@argent/x-ui"
import { iconsDeprecated } from "@argent/x-ui"
import { Spinner } from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"

import { useIsMultisigDeploying } from "./hooks/useIsMultisigDeploying"
import { Multisig } from "./Multisig"
import { clientAccountService } from "../../services/account"

const { MultisigIcon } = iconsDeprecated

export const MultisigBanner: FC<{
  multisig: Multisig
  hasFeeTokenBalance?: boolean
}> = ({ multisig, hasFeeTokenBalance }) => {
  const isMultisigDeploying = useIsMultisigDeploying(multisig)

  const showActivateMultisigBanner = useMemo(
    () => !isMultisigDeploying && multisig.needsDeploy && hasFeeTokenBalance,
    [hasFeeTokenBalance, isMultisigDeploying, multisig.needsDeploy],
  )

  const onActivateMultisig = useCallback(async () => {
    if (multisig) {
      await clientAccountService.deploy(multisig)
    }
  }, [multisig])

  if (showActivateMultisigBanner) {
    return (
      <AlertButton
        data-testid="activate-multisig"
        size="md"
        title="Activate multisig"
        description="Click to activate the multisig"
        icon={<MultisigIcon color="neutrals.900" fontSize="2xl" />}
        colorScheme="primary"
        bg="primaryExtraDark.500"
        onClick={onActivateMultisig}
      />
    )
  }

  if (isMultisigDeploying) {
    return (
      <AlertButton
        data-testid="activating-multisig"
        colorScheme={"warning"}
        title="Activating multisig"
        description="Waiting for the multisig to be activated"
        size="lg"
        icon={<Spinner />}
      />
    )
  }

  return null
}
