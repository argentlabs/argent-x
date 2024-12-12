import { useView } from "../../views/implementation/react"
import { knownDappsAtom } from "../../views/knownDapps"

export function useKnownDapps() {
  const knownDapps = useView(knownDappsAtom)
  return knownDapps
}
