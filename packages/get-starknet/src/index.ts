import type { ConnectOptions, StarknetWindowObject } from "get-starknet"
import { connect as connectCommunity } from "get-starknet"

export { disconnect, type StarknetWindowObject } from "get-starknet"

/**
 * Connect to a Starknet wallet.
 *
 * @dev Use the community version `get-starknet` from npm instead.
 * @param {GetStarknetWalletOptions} [options]
 * @returns {Promise<StarknetWindowObject>}
 */
export const connect = (
  options?: ConnectOptions,
): Promise<StarknetWindowObject | undefined> => {
  return connectCommunity({
    sort: ["argentX"],
    alwaysShowDiscovery: false,
    ...options,
  })
}
