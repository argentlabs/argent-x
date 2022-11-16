import fs from "fs"
import path from "path"

import { account } from "./account"

/** read the compiled contract JSON as plain text */
const compiledMulticallContract = fs.readFileSync(
  path.join(__dirname, "./abis/Multicall.json"),
  "utf-8",
)

/** 'declare' the contract and return the class hash */
export async function declareMulticallContract(): Promise<string | undefined> {
  const response = await account.declare({
    contract: compiledMulticallContract,
    classHash:
      "0x0381f14e5e0db5889c981bf050fb034c0fbe0c4f070ee79346a05dbe2bf2af90",
  })
  await account.waitForTransaction(response.transaction_hash, 1e3) // wait for transaction to be mined (poll every second)
  return response.class_hash
}
