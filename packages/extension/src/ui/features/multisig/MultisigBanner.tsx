import { AlertButton } from "@argent/ui"
import { icons } from "@argent/ui"
import { Spinner } from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"

import { accountService } from "../../../shared/account/service"
import { useIsMultisigDeploying } from "./hooks/useIsMultisigDeploying"
import { Multisig } from "./Multisig"

const { MultisigIcon } = icons

export const MultisigBanner: FC<{
  multisig: Multisig
  feeTokenBalance?: bigint
}> = ({ multisig, feeTokenBalance }) => {
  const isMultisigDeploying = useIsMultisigDeploying(multisig)

  const showActivateMultisigBanner = useMemo(
    () =>
      !isMultisigDeploying &&
      multisig.needsDeploy &&
      feeTokenBalance &&
      feeTokenBalance > 0n,
    [feeTokenBalance, isMultisigDeploying, multisig.needsDeploy],
  )

  const onActivateMultisig = useCallback(async () => {
    if (multisig) {
      await accountService.deploy(multisig)
    }
  }, [multisig])

  if (showActivateMultisigBanner) {
    return (
      <AlertButton
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
