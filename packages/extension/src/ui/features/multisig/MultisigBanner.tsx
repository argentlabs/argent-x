import { AlertButton } from "@argent/ui"
import { icons } from "@argent/ui"
import { Spinner } from "@chakra-ui/react"
import { BigNumber } from "ethers"
import { FC, useCallback, useMemo } from "react"

import { deployNewMultisig } from "../../services/backgroundAccounts"
import { useIsMultisigDeploying } from "./hooks/useIsMultisigDeploying"
import { Multisig } from "./Multisig"

const { MultisigIcon } = icons

export const MultisigBanner: FC<{
  multisig: Multisig
  feeTokenBalance?: BigNumber
}> = ({ multisig, feeTokenBalance }) => {
  const isMultisigDeploying = useIsMultisigDeploying(multisig)

  const showActivateMultisigBanner = useMemo(
    () =>
      !isMultisigDeploying && multisig.needsDeploy && feeTokenBalance?.gt(0),
    [feeTokenBalance, isMultisigDeploying, multisig.needsDeploy],
  )

  const onActivateMultisig = useCallback(async () => {
    if (multisig) {
      await deployNewMultisig(multisig)
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
        title={"Deploying multisig"}
        description="Waiting for the multisig to be deployed"
        size="lg"
        icon={<Spinner />}
      />
    )
  }

  return null
}
