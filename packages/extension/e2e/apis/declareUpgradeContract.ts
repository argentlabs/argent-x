import fs from "fs"
import path from "path"

import { account } from "./account"

/** read the compiled contract JSON as plain text */
const compiledUpgradeContract = fs.readFileSync(
  path.join(__dirname, "./abis/ArgentAccountOnlyForLocalTesting.json"),
  "utf-8",
)

/** 'declare' the contract and return the class hash */
export async function declareUpgradeContract(): Promise<string | undefined> {
  const response = await account.declare({
    contract: compiledUpgradeContract,
    classHash:
      "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
  })
  await account.waitForTransaction(response.transaction_hash, undefined, 1e3) // wait for transaction to be mined (poll every second)
  return response.class_hash
}
