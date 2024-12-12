import { useMemo } from "react"
import { useKnownDapps } from "./knownDapps"

export const normalizeHost = (h: string) => h.replace(/^www\./i, "")

export function useDappFromKnownDappsByHost(host: string) {
  const knownDapps = useKnownDapps()

  return useMemo(
    () =>
      knownDapps?.find((knownDapp) => {
        if (!knownDapp.dappUrl) {
          return undefined
        }

        try {
          const knownHost = new URL(knownDapp.dappUrl).host
          const inputHost = new URL(host).host
          return normalizeHost(knownHost) === normalizeHost(inputHost)
        } catch {
          return undefined
        }
      }),
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
        knownDapp.contracts?.some(
          (contract) =>
            contract.address === contractAddress &&
            contract.chain === "starknet",
        ),
      ),
    [contractAddress, knownDapps],
  )
}

export function useDappFromKnownDappsByName(name?: string) {
  const knownDapps = useKnownDapps()

  return useMemo(
    () =>
      name
        ? knownDapps?.find(
            (knownDapp) =>
              knownDapp.name.toLowerCase().trim() === name.toLowerCase().trim(),
          )
        : undefined,
    [name, knownDapps],
  )
}
