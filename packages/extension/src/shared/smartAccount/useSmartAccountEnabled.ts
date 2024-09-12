import { useIsDefaultNetwork } from "../../ui/features/networks/hooks/useIsDefaultNetwork"
import { ARGENT_API_ENABLED } from "../api/constants"

/**
 * Smart Account is enabled only on the default network of each environment
 */
export const useSmartAccountEnabled = () => {
  const isDefaultNetwork = useIsDefaultNetwork()

  return ARGENT_API_ENABLED && isDefaultNetwork
}
