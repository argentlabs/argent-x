import { bigDecimal } from "@argent/shared"
import { Abi, Contract, num, uint256 } from "starknet"

import Erc20Abi from "../../abi/ERC20.json"
import { windowStarknet } from "./wallet.service"

export const ETHTokenAddress =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

export const DAITokenAddress =
  "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3"

function getUint256CalldataFromBN(bn: num.BigNumberish) {
  return uint256.bnToUint256(bn)
}

export function parseInputAmountToUint256(
  input: string,
  decimals: number = 18,
) {
  return getUint256CalldataFromBN(bigDecimal.parseUnits(input, decimals))
}

export const mintToken = async (mintAmount: string): Promise<any> => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    ETHTokenAddress,
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
    ETHTokenAddress,
    windowStarknet.account as any,
  )

  return erc20Contract.transfer(
    transferTo,
    parseInputAmountToUint256(transferAmount),
  )
}
