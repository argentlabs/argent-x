import fs from "fs"
import path from "path"

import { account, provider } from "./account"

/** read the compiled contract JSON as plain text */
const compiledUpgradeContract = fs.readFileSync(
  path.join(__dirname, "./abis/ArgentAccountOnlyForLocalTesting.json"),
  "utf-8",
)

/** 'declare' the contract and return the class hash */
export async function declareUpgradeContract(): Promise<string | undefined> {
  const response = await provider.declareContract({
    contract: compiledUpgradeContract,
  })
  await account.waitForTransaction(response.transaction_hash, 1e3) // wait for transaction to be mined (poll every second)
  return response.class_hash
}
