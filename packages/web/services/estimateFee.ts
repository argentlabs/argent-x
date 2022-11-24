import { BigNumber, providers } from "ethers"
import { Call, hash, number, stark } from "starknet"

import {
  ACCOUNT_IMPLEMENTATION_CLASS_HASH,
  PROXY_CLASS_HASH,
  getAccount,
} from "./account"
import { getAccounts } from "./backend/account"
import { l1Provider, provider } from "./provider"

export const isContractDeployed = async (
  contractAddress: string,
): Promise<boolean> => {
  try {
    await provider.getClassHashAt(contractAddress)
    return true
  } catch (e) {
    return false
  }
}

export interface EstimateFeeResponse {
  fee: bigint
  maxFee: bigint
}

export const estimateTransactions = async (
  calls: Call[],
): Promise<EstimateFeeResponse> => {
  const account = await getAccount()
  if (!account) throw Error("account not found")

  const isDeployed = await isContractDeployed(account.address)

  if (!isDeployed) {
    return calculateEstimateFeeFromL1Gas(calls)
  }

  const fee = await account.estimateInvokeFee(calls)
  const maxFee = stark.estimatedFeeToMaxFee(fee.overall_fee)

  return {
    fee: BigInt(fee.overall_fee.toString()),
    maxFee: BigInt(maxFee.toString()),
  }
}

export type EstimateDeploymentFeeResponse =
  | {
      needsDeploy: false
    }
  | ({
      needsDeploy: true
    } & EstimateFeeResponse)

export const estimateDeployment =
  async (): Promise<EstimateDeploymentFeeResponse> => {
    const account = await getAccount()
    if (!account) throw Error("account not found")

    const isDeployed = await isContractDeployed(account.address)

    if (isDeployed) {
      return {
        needsDeploy: false,
      }
    }

    const [beAccount] = await getAccounts()
    const fee = await account.estimateAccountDeployFee({
      classHash: PROXY_CLASS_HASH,
      constructorCalldata: stark.compileCalldata({
        implementation: ACCOUNT_IMPLEMENTATION_CLASS_HASH,
        selector: hash.getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({
          signer: beAccount.ownerAddress,
          guardian: "0",
        }),
      }),
      addressSalt: beAccount.salt,
    })
    const maxFee = stark.estimatedFeeToMaxFee(fee.overall_fee)

    return {
      needsDeploy: true,
      fee: BigInt(fee.overall_fee.toString()),
      maxFee: BigInt(maxFee.toString()),
    }
  }

export const calculateEstimateFeeFromL1Gas = async (
  transactions: Call[],
  l1ProviderInstance = l1Provider,
): Promise<EstimateFeeResponse> => {
  const fallbackPrice = BigInt(10e14)
  try {
    if (!l1ProviderInstance) {
      throw Error("no l1 provider")
    }

    const l1GasPrice = await l1ProviderInstance.getGasPrice()
    const multiplier = BigNumber.from(3744)

    const price = l1GasPrice.mul(transactions.length).mul(multiplier).toString()

    return {
      fee: BigInt(price),
      maxFee: BigInt(stark.estimatedFeeToMaxFee(price).toString()),
    }
  } catch {
    console.warn("Could not get L1 gas price")
    return {
      fee: fallbackPrice,
      maxFee: stark.estimatedFeeToMaxFee(number.toBN(fallbackPrice.toString())),
    }
  }
}
