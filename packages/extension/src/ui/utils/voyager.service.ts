import { getNetwork } from "../../shared/networks"
import { VoyagerTransaction } from "./voyager.model"

export const fetchVoyagerTransactions = async (
  address: string,
  networkId: string,
): Promise<VoyagerTransaction[]> => {
  const { explorerUrl } = getNetwork(networkId)
  if (!explorerUrl) {
    return []
  }
  const response = await fetch(`${explorerUrl}/api/txns?to=${address}`)
  const { items } = await response.json()
  return items
}

export const openVoyagerTransaction = (hash: string, networkId: string) => {
  const { explorerUrl } = getNetwork(networkId)
  if (explorerUrl) {
    window.open(`${explorerUrl}/tx/${hash}`, "_blank")?.focus()
  }
}
