import { FC } from "react"

import { Alert, SpacerCell, iconsDeprecated } from "@argent/x-ui"

import { useConstructorParams } from "./useConstructorParams"
import { DeploySmartContractParameters } from "./DeploySmartContractParameters"

const { AlertIcon } = iconsDeprecated

export const DeploySmartContractParametersContainer: FC<{
  currentClassHash: string
  currentNetwork: string
}> = ({
  currentClassHash,
  currentNetwork,
}: {
  currentClassHash: string
  currentNetwork: string
}) => {
  const {
    error: fetchError,
    isValidating: isLoading,
    contractClass,
  } = useConstructorParams(currentClassHash, currentNetwork)
  return (
    <>
      {fetchError && (
        <>
          <SpacerCell />
          <Alert
            icon={<AlertIcon />}
            colorScheme={"error"}
            description={`${fetchError}`}
          />
        </>
      )}
      <SpacerCell />
      {contractClass && (
        <DeploySmartContractParameters
          isLoading={isLoading}
          constructorParameters={contractClass.abi}
        />
      )}
    </>
  )
}
