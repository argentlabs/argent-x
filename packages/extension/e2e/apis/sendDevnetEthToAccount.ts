import { Account, Provider, ec, number, stark, uint256 } from "starknet"

// Spin up devnet with `starknet-devnet --seed 0` to get these values

const pk = "0xe3e70682c2094cac629f6fbed82c07cd" // put hex representation of private key here

const provider = new Provider({ baseUrl: "http://127.0.0.1:5050/" }) // connect to devnet
const keyPair = ec.getKeyPair(pk)
const account = new Account(
  provider,
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a".toLowerCase(), // put account address which is controlled by the private key here
  keyPair,
)

export async function sendDevnetEthToAccount(address: string) {
  const response = await account.execute({
    contractAddress:
      "0x6A7A6243F92A347C03C935CE4834C47CBD2A951536C10319168866DB9D57983".toLowerCase(), // fee token address on devnet
    entrypoint: "transfer",
    calldata: stark.compileCalldata({
      recipient: address.toLowerCase(), // put recipient address here
      amount: {
        type: "struct",
        ...uint256.bnToUint256(number.toBN("1000000000000000000")), // 1 ETH (1e18 wei)
      },
    }),
  })

  await account.waitForTransaction(response.transaction_hash, 1e3) // wait for transaction to be mined (poll every second)
}
