import { AccountDeploymentData } from "@starknet-io/types-js"
import { inpageMessageClient } from "../trpcClient"

const toHex = (x: bigint) => `0x${x.toString(16)}`

const isStringArray = (x: any): x is string[] =>
  x.every((y: any) => typeof y === "string")

export async function deploymentDataHandler(): Promise<AccountDeploymentData> {
  const deploymentData =
    await inpageMessageClient.accountMessaging.getAccountDeploymentPayload.query()

  if (!deploymentData) {
    throw new Error("Deployment data not found")
  }

  const {
    version,
    classHash,
    constructorCalldata,
    addressSalt,
    contractAddress,
  } = deploymentData

  if (!classHash || !constructorCalldata || !addressSalt || !contractAddress) {
    throw new Error("Deployment data not found")
  }

  if (!isStringArray(constructorCalldata)) {
    throw new Error("Constructor calldata is not an array of hex strings")
  }

  const _addressSalt = toHex(BigInt(addressSalt))
  const _callData = constructorCalldata.map((x) => toHex(BigInt(x)))

  if (!version) {
    throw new Error("Account's Cairo Version not found")
  }

  return {
    address: contractAddress,
    class_hash: classHash,
    salt: _addressSalt,
    calldata: _callData,
    version: Number(version) as 0 | 1, // so bad :(
  }
}
