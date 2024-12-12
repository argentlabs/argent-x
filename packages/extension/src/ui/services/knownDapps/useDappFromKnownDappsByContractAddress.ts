import { useMemo } from "react"

import { useKnownDapps } from "./useKnownDapps"

export function useDappFromKnownDappsByContractAddress(
  contractAddress: string,
) {
  const knownDapps = useKnownDapps()

  return useMemo(
    () =>
      knownDapps?.find((knownDapp) =>
        knownDapp.contracts?.some(
          (contract) =>
            contract.address === contractAddress &&
            contract.chain === "starknet",
        ),
      ),
    [contractAddress, knownDapps],
  )
}
