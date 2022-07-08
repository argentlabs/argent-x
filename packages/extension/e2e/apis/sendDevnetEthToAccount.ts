import { number, stark, uint256 } from "starknet"

import { account } from "./account"

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
