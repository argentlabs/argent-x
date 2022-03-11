import { getStarknet } from "@argent/get-starknet"
import { utils } from "ethers"
import { Abi, Contract, number, uint256 } from "starknet"

import Erc20Abi from "../../abi/ERC20.json"

export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
  "mainnet-alpha":
    "0x06a09ccb1caaecf3d9683efe335a667b2169a409d19c589ba1eb771cd210af75",
}

export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork
export type Network = PublicNetwork | "localhost"

export const getErc20TokenAddress = (network: PublicNetwork) =>
  erc20TokenAddressByNetwork[network]

function getUint256CalldataFromBN(bn: number.BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(bn) }
}

function parseInputAmountToUint256(input: string, decimals: number = 18) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}

export const mintToken = async (
  mintAmount: string,
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()

  const [activeAccount] = await starknet.enable()

  // checks that enable succeeded
  if (starknet.isConnected === false) {
    throw Error("starknet wallet not connected")
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    getErc20TokenAddress(network),
    starknet.account,
  )

  return erc20Contract.mint(
    activeAccount,
    parseInputAmountToUint256(mintAmount),
  )
}

export const transfer = async (
  transferTo: string,
  transferAmount: string,
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()

  await starknet.enable()

  // checks that enable succeeded
  if (starknet.isConnected === false) {
    throw Error("starknet wallet not connected")
  }

  const erc20Contract = new Contract(
    Erc20Abi as any,
    getErc20TokenAddress(network),
    starknet.account,
  )

  return erc20Contract.transfer(
    transferTo,
    parseInputAmountToUint256(transferAmount),
  )
}
