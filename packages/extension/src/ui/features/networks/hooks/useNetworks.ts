import { networksView } from "../../../../shared/network/view"
import { useView } from "../../../views/implementation/react"

export const useNetworks = () => {
  const networks = useView(networksView)

  return networks
}
