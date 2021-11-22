import { getStarknet } from "@argent/get-starknet"
import { utils } from "ethers"
import { number, stark } from "starknet"

export const erc20TokenAddress =
  "0x00a45e3942b7a75983dea7afffda9304d0273773619d1e3d5eaa757d751bfaf3"

const mintSelector = stark.getSelectorFromName("mint")

const transferSelector = stark.getSelectorFromName("transfer")

export const mintToken = async (mintAmount: string): Promise<any> => {
  const starknet = getStarknet()

  const [activeAccount] = await starknet.enable()

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected")

  return await starknet.signer.invokeFunction(
    erc20TokenAddress, // to (erc20 contract)
    mintSelector, // selector (mint)
    [
      number.toBN(activeAccount).toString(), //receiver (self)
      utils.parseUnits(mintAmount, 18).toString(), // amount
    ],
  )
}

export const transfer = async (
  transferTo: string,
  transferAmount: string,
): Promise<any> => {
  const starknet = getStarknet()

  await starknet.enable()

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected")

  return starknet.signer.invokeFunction(
    erc20TokenAddress, // to (erc20 contract)
    transferSelector, // selector (mint)
    [
      number.toBN(transferTo).toString(), //receiver (self)
      utils.parseUnits(transferAmount, 18).toString(), // amount
    ],
  )
}
