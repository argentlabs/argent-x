import { useMemo } from "react"

import { useKnownDapps } from "./useKnownDapps"

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
