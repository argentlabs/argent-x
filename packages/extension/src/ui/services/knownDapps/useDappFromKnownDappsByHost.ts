import { useMemo } from "react"

import { useKnownDapps } from "./useKnownDapps"

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
