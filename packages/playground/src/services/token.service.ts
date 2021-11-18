import { getStarknet } from "@argent/get-starknet"
import { utils } from "ethers"
import { number } from "starknet"

import { watchAsset } from "./wallet.service"

export const erc20TokenAddress =
  "0x4e3920043b272975b32dfc0121817d6e6a943dc266d7ead1e6152e472201f97"

const mintSelector =
  "0x2f0b3c5710379609eb5495f1ecd348cb28167711b73609fe565a72734550354"

const transferSelector =
  "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e"

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

export const addToken = async (): Promise<void> => {
  await watchAsset({
    type: "ERC20",
    options: {
      address: erc20TokenAddress,
      symbol: "TEST",
      decimals: 18,
    },
  })
}
