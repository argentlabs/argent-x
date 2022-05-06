import { readFileSync, writeFileSync } from "fs"

import { json } from "starknet"

const argentContract = readFileSync(
  `${__dirname}/../packages/extension/src/contracts/ArgentAccount.txt`,
  "ascii",
)
const proxyContract = readFileSync(
  `${__dirname}/../packages/extension/src/contracts/Proxy.txt`,
  "ascii",
)

console.log(argentContract ? "found ArgentAccount" : "no ArgentAccount")
console.log(proxyContract ? "found Proxy" : "no Proxy")

function minimize(contract: string): string {
  return json.stringify(json.parse(contract))
}

writeFileSync(
  `${__dirname}/../packages/extension/src/contracts/ArgentAccount.txt`,
  minimize(argentContract),
  "ascii",
)
writeFileSync(
  `${__dirname}/../packages/extension/src/contracts/Proxy.txt`,
  minimize(proxyContract),
  "ascii",
)
