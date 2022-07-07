import { Account, Provider, ec } from "starknet"

/** These values are from passing --seed 0 --accounts 1 to starkent-devnet and are ONLY for local testing */
const pkOnlyForLocalTesting = "0xe3e70682c2094cac629f6fbed82c07cd"
const fromAddressOnlyForLocalTesting =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

export const provider = new Provider({
  baseUrl: "http://127.0.0.1:5050/",
})

const keyPair = ec.getKeyPair(pkOnlyForLocalTesting)

export const account = new Account(
  provider,
  fromAddressOnlyForLocalTesting,
  keyPair,
)
