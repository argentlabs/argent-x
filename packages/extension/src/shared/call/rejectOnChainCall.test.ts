import { Call } from "starknet"
import { ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS } from "../network/constants"
import { isRejectOnChainCall } from "./rejectOnChainCall"

describe("rejectOnChainCall", () => {
  test("isRejectOnChainCall should return true for valid call", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: "transfer",
      calldata: ["0x123", "0", "0"],
    }
    const senderAddress = "0x123"

    expect(isRejectOnChainCall(call, senderAddress)).toBe(true)
  })

  test("isRejectOnChainCall should return false for invalid calldata length", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: "transfer",
      calldata: ["0x123", "0"],
    }
    const senderAddress = "0x123"

    expect(isRejectOnChainCall(call, senderAddress)).toBe(false)
  })

  test("isRejectOnChainCall should return false for invalid token address", () => {
    const call: Call = {
      entrypoint: "transfer",
      calldata: ["0x123", "0", "0"],
      contractAddress: STRK_TOKEN_ADDRESS,
    }
    const senderAddress = "0x123"

    expect(isRejectOnChainCall(call, senderAddress)).toBe(false)
  })

  test("isRejectOnChainCall should return false for invalid recipient address", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: "transfer",
      calldata: ["0x123", "0", "0"],
    }
    const senderAddress = "0x456"

    expect(isRejectOnChainCall(call, senderAddress)).toBe(false)
  })

  test("isRejectOnChainCall should return false for invalid amount", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: "transfer",
      calldata: ["0x123", "0", "1"],
    }
    const senderAddress = "0x123"

    expect(isRejectOnChainCall(call, senderAddress)).toBe(false)
  })

  test("isRejectOnChainCall should return false for invalid entrypoint", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: "swap",
      calldata: ["0x123", "0", "1"],
    }
    const senderAddress = "0x123"

    expect(isRejectOnChainCall(call, senderAddress)).toBe(false)
  })
})
