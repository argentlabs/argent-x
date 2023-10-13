import { num } from "starknet"
import useSWR from "swr"

import { Network, getProvider } from "../../../shared/network"

export const useTransactionNonce = ({
  network,
  hash,
}: {
  network: Network
  hash?: string
}) => {
  const { data: nonce } = useSWR([hash, network.id, "nonce"], async () => {
    if (!hash) {
      return
    }
    const tx = await getProvider(network).getTransaction(hash)
    return "nonce" in tx && tx.nonce && num.hexToDecimalString(tx.nonce)
  })

  return nonce
}
