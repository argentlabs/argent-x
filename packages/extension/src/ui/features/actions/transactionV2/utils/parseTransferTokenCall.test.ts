import { test } from "vitest"
import { parseTransferTokenCall } from "./parseTransferTokenCall"
import type { Call } from "starknet"
import { uint256 } from "starknet"
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
} from "../../../../../shared/network/constants"

test("parseTransferTokenCall", () => {
  const mockCall: Call = {
    entrypoint: "transfer",
    contractAddress: ETH_TOKEN_ADDRESS,
    calldata: [STRK_TOKEN_ADDRESS, "0x789", "0xabc"],
  }

  const result = parseTransferTokenCall(mockCall)

  expect(result).toEqual({
    tokenAddress: ETH_TOKEN_ADDRESS,
    recipient: STRK_TOKEN_ADDRESS,
    amount: uint256.uint256ToBN({
      low: "0x789",
      high: "0xabc",
    }),
  })
})
