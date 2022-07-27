import { number, stark, uint256 } from "starknet"

import { account } from "./account"

export async function sendDevnetEthToAccount(address: string) {
  const response = await account.execute({
    contractAddress:
      "0x62230ea046a9a5fbc261ac77d03c8d41e5d442db2284587570ab46455fd2488".toLowerCase(), // fee token address on devnet
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
