import { getStarknet } from "@argent/get-starknet"
import { utils } from "ethers"
import { number, stark, uint256 } from "starknet"

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

  const receiver = number.toBN(activeAccount).toString()
  const amount = getUint256CalldataFromBN(
    utils.parseUnits(mintAmount, 18).toString(),
  )

  return await starknet.account.execute({
    contractAddress: erc20TokenAddressByNetwork[network],
    entrypoint: "mint",
    calldata: stark.compileCalldata({ receiver, amount }),
  })
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

  return starknet.account.execute({
    contractAddress: erc20TokenAddressByNetwork[network],
    entrypoint: "transfer",
    calldata: stark.compileCalldata({
      receiver: number.toBN(transferTo).toString(),
      amount: getUint256CalldataFromBN(
        utils.parseUnits(transferAmount, 18).toString(),
      ),
    }),
  })
}
