import { declareUpgradeContract } from "@argent-x/extension/e2e/apis/declareUpgradeContract"
import { mintDevnetEthToAccount } from "@argent-x/extension/e2e/apis/sendDevnetEthToAccount"
import { validateAndParseAddress } from "starknet"

import prompt from "./utils/prompt"
;(async () => {
  console.log("Declaring upgrade contract...")

  const classHash = await declareUpgradeContract()

  console.log(
    `Default contract class hash: 0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328`,
  )
  console.log(`Upgrade contract class hash: ${classHash}`)
  console.log("")

  let previousAddress = ""
  let keepAsking = true

  while (keepAsking) {
    console.log("Enter a localhost wallet address to transfer Ξ1")
    previousAddress &&
      previousAddress.length &&
      console.log(`(Leave empty to use ${previousAddress}`)
    const address = ((await prompt("Address: ")) as string) || previousAddress
    let addressIsValid = false
    try {
      addressIsValid = !!(address && validateAndParseAddress(address))
    } catch (e) {
      // ignore validateAndParseAddress error
    }
    if (addressIsValid) {
      previousAddress = address
      console.log(`Transferring Ξ1 to ${address}`)
      await mintDevnetEthToAccount(address)
    } else {
      console.log(`"${address}" is not valid wallet address`)
    }
  }
})()
