import type {
  GetStarknetWalletOptions,
  IStarknetWindowObject,
} from "get-starknet"
import {
  connect as connectCommunity,
  getStarknet as getStarknetCommunity,
} from "get-starknet"

export type {
  EventHandler,
  EventType,
  GetStarknetWalletOptions,
  IGetStarknetWallet,
  IStarknetWindowObject,
  IStorageWrapper,
  ModalOptions,
  WalletProvider,
} from "get-starknet"
export { disconnect } from "get-starknet"

/**
 * Get the Starknet window object.
 *
 * @deprecated Please use the connect export and the returned wallet object instead.
 * @returns {Promise<IStarknetWindowObject>}
 */
export const getStarknet = (): IStarknetWindowObject => {
  const starknet = getStarknetCommunity()

  starknet.enable = async (options?: {
    showModal?: boolean
  }): Promise<string[]> => {
    const wallet = await connect({ showList: options?.showModal })
    return wallet?.enable(options) || []
  }

  return starknet
}

/**
 * Connect to a Starknet wallet.
 *
 * @dev Use the community version `get-starknet` from npm instead.
 * @param {GetStarknetWalletOptions} [options]
 * @returns {Promise<IStarknetWindowObject>}
 */
export const connect = (
  options?: GetStarknetWalletOptions,
): Promise<IStarknetWindowObject | undefined> => {
  return connectCommunity({
    order: ["argentX"],
    ...options,
  })
}
