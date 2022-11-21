import { BigNumber, utils } from "ethers"
import { Call, number, uint256 } from "starknet"

import { addressSchema } from "../../schemas/primitives/address"
import tokens from "../tokens/default-tokens.json"
import { ReviewBlock } from "."

export async function reviewErc20Transfer(call: Call): Promise<ReviewBlock> {
  const token = tokens.find((token) => token.address === call.contractAddress)
  if (!token) {
    throw Error(`${call.contractAddress} is not a known ERC20 token`)
  }
  if (call.entrypoint !== "transfer") {
    throw Error(`${call.entrypoint} !== transfer`)
  }
  const to = number.toHex(number.toBN(call.calldata?.[0]))
  console.log("to", to)
  if (!addressSchema.safeParse(to).success) {
    throw Error(`Invalid to address: ${to}`)
  }

  try {
    const amount = BigInt(
      uint256
        .uint256ToBN({
          low: call.calldata?.[1],
          high: call.calldata?.[2],
        })
        .toString(),
    )

    const formattedAmount = utils.formatUnits(
      BigNumber.from(amount.toString()),
      token.decimals,
    )

    return {
      rows: [
        {
          title: "Send",
          value: `${formattedAmount} ${token.symbol}`,
        },
      ],
    }
  } catch (e) {
    throw Error(`Invalid amount: ${call.calldata}`)
  }
}
