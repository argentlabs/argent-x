import fs from "fs"
import path from "path"

import prompt from "prompt"
import {
  Account,
  Provider,
  ec,
  number,
  stark,
  uint256,
  validateAndParseAddress,
} from "starknet"

/** Fee token address on devnet */
const feeTokenContractAddressOnlyForLocalTesting =
  "0x6a7a6243f92a347c03c935ce4834c47cbd2a951536c10319168866db9d57983"

/** NOTE: these values are from passing --seed 0 --accounts 1 to starkent-devenet and are ONLY for local testing */
const pkOnlyForLocalTesting = "0xe3e70682c2094cac629f6fbed82c07cd"
const fromAddressOnlyForLocalTesting =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

const provider = new Provider({
  baseUrl: "http://127.0.0.1:5050/",
})
const keyPair = ec.getKeyPair(pkOnlyForLocalTesting)
const account = new Account(provider, fromAddressOnlyForLocalTesting, keyPair)

/** read the compiled contract JSON as plain text */
const compiledUpgradeContract = fs.readFileSync(
  path.join(__dirname, "./ArgentAccountForLocalTestingOnly.json"),
  "utf-8",
)

/** 'declare' the contract and print the class hash to console */
const declareUpgradeContract = async () => {
  console.log("Declaring upgrade contract...")
  const response = await provider.declareContract({
    contract: compiledUpgradeContract,
  })
  console.log("Waiting for transaction to be mined...")
  await account.waitForTransaction(response.transaction_hash, 1e3) // NOTE: wait for transaction to be mined (poll every second)
  console.log(
    `Default contract class hash: 0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328`,
  )
  console.log("Upgrade contract class hash:", response.class_hash)
  console.log("")
}

/** 'declare' the contract and print the class hash to console */
const transferOneEth = async (recipient: string) => {
  console.log(`Transferring 1 ETH to ${recipient}`)
  const response = await account.execute({
    contractAddress: feeTokenContractAddressOnlyForLocalTesting,
    entrypoint: "transfer",
    calldata: stark.compileCalldata({
      recipient,
      amount: {
        type: "struct",
        ...uint256.bnToUint256(number.toBN("1000000000000000000")), // NOTE: 1 ETH (1e18 wei)
      },
    }),
  })
  console.log("Transaction hash: ", response.transaction_hash)
  console.log("Waiting for transaction to be mined...")
  await account.waitForTransaction(response.transaction_hash, 1e3) // NOTE: wait for transaction to be mined (poll every second)
  console.log("")
}

;(async () => {
  /** clear default 'prompt' message */
  prompt.message = ""

  await declareUpgradeContract()

  let previousAddress = ""
  let keepAsking = true

  while (keepAsking) {
    console.log("Enter a localhost wallet address to transfer 1 ETH")
    previousAddress &&
      previousAddress.length &&
      console.log(`(Leave empty to use ${previousAddress}`)
    try {
      const result = await prompt.get([
        {
          name: "address",
          description: "Address",
          type: "string",
        },
      ])
      const address: string = (result.address as string) || previousAddress
      let addressIsValid
      try {
        addressIsValid = address && validateAndParseAddress(address)
      } catch (e) {
        // ignore validateAndParseAddress error
      }
      if (addressIsValid) {
        previousAddress = address
        await transferOneEth(address)
      } else {
        console.log(`"${address}" is not valid wallet address`)
      }
    } catch (e) {
      if (e instanceof Error && e.message === "canceled") {
        // consume 'cancel' error from 'prompt', just cleanly stop
        keepAsking = false
      } else {
        throw e
      }
    }
  }
})()
