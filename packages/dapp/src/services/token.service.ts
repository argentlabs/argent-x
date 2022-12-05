import { connect } from "@argent/get-starknet"
import { utils } from "ethers"
import { Abi, Contract, number, uint256 } from "starknet"

import Erc20Abi from "../../abi/ERC20.json"
import { windowStarknet } from "./wallet.service"

export const erc20TokenAddress =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

function getUint256CalldataFromBN(bn: number.BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(bn) }
}

export function parseInputAmountToUint256(
  input: string,
  decimals: number = 18,
) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}

export const mintToken = async (mintAmount: string): Promise<any> => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    erc20TokenAddress,
    windowStarknet.account as any,
  )

  const address = windowStarknet.selectedAddress

  return erc20Contract.mint(address, parseInputAmountToUint256(mintAmount))
}

export const transfer = async (
  transferTo: string,
  transferAmount: string,
): Promise<any> => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }

  const erc20Contract = new Contract(
    Erc20Abi as any,
    erc20TokenAddress,
    windowStarknet.account as any,
  )

  return erc20Contract.transfer(
    transferTo,
    parseInputAmountToUint256(transferAmount),
  )
}
