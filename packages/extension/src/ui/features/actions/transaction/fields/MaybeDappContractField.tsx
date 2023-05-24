import { FC } from "react"

import { getKnownDappForContractAddress } from "../../../../../shared/knownDapps"
import { DappContractField } from "./DappContractField"

interface MaybeDappContractFieldProps {
  contractAddress: string
}

export const MaybeDappContractField: FC<MaybeDappContractFieldProps> = ({
  contractAddress,
}) => {
  const knownContract = getKnownDappForContractAddress(contractAddress)
  if (!knownContract) {
    return null
  }
  return <DappContractField knownContract={knownContract} />
}
