import { useMemo } from "react"
import { useView } from "../../views/implementation/react"
import { knownDappsAtom } from "../../views/knownDapps"

export function useKnownDapps() {
  const knownDapps = useView(knownDappsAtom)
  return knownDapps
}

export function useDappFromKnownDappsByHost(host: string) {
  const knownDapps = useKnownDapps()

  return useMemo(
    () =>
      knownDapps?.find(
        (knownDapp) =>
          knownDapp.dappUrl &&
          new URL(knownDapp.dappUrl).host === new URL(host).host,
      ),
    [host, knownDapps],
  )
}

export function useDappFromKnownDappsByContractAddress(
  contractAddress: string,
) {
  const knownDapps = useKnownDapps()

  return useMemo(
    () =>
      knownDapps?.find((knownDapp) =>
        knownDapp.contracts.some(
          (contract) =>
            contract.address === contractAddress &&
            contract.chain === "starknet",
        ),
      ),
    [contractAddress, knownDapps],
  )
}
