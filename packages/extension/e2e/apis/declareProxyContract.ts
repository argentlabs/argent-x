import fs from "fs"
import path from "path"

import { account } from "./account"

/** read the compiled contract JSON as plain text */
const compiledProxyContract = fs.readFileSync(
  path.join(__dirname, "./abis/Proxy.json"),
  "utf-8",
)

/** 'declare' the contract and return the class hash */
export async function declareProxyContract(): Promise<string | undefined> {
  const response = await account.declare({
    contract: compiledProxyContract,
    classHash:
      "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
  })
  await account.waitForTransaction(response.transaction_hash, 1e3) // wait for transaction to be mined (poll every second)
  return response.class_hash
}
