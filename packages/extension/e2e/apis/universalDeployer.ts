// Currently unused, but kept so we don't have to re-write it later if we need it

import { Abi, Contract } from "starknet"

import UniversalDeployerAbi from "./abis/UniversalDeployer.json"
import { account } from "./account"

/** The address of the UDC, set to devnet by default - {@link https://shard-labs.github.io/starknet-devnet/docs/guide/udc} */
const DEFAULT_UDC_ADDRESS =
  "0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"

/**
 * Deploys a declared contract by using invoke on the Universal Deployer Contract (UDC)
 *
 * The UDC will deploy for you - so deployed contract address will be stable as its based on UDC address
 * rather than the account address
 *
 * @param classHash the class hash of the declared contract
 * @param universalDeployerContractAddress the address of the UDC, set to devnet by default
 * @returns currently only the transaction hash, not the deployed account address. The address may only be found in the invoke events
 */

export async function universalDeployerDeployContract(
  classHash: string,
  universalDeployerContractAddress = DEFAULT_UDC_ADDRESS,
) {
  const universalDeployerContract = new Contract(
    UniversalDeployerAbi as Abi,
    universalDeployerContractAddress,
    account,
  )
  const response = await universalDeployerContract.deployContract(
    classHash,
    0, // salt (don't need salt)
    0, // unique (otherwise you get a different address)
    [], // calldata
  )

  await account.waitForTransaction(response.transaction_hash, 1e3) // wait for transaction to be mined (poll every second)
  return response
}
