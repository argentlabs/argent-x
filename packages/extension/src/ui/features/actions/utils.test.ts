import type { Call } from "starknet"
import { getV3UpgradeCall } from "./utils"

describe("getV3UpgradeCall", () => {
  it("should return the first call that matches the condition", () => {
    const calls: Call[] = [
      {
        contractAddress: "0x0000000000",
        entrypoint: "deploy",
        calldata: [1, 2, 3],
      },
      {
        contractAddress: "0x0000000000",
        entrypoint: "upgrade",
        calldata: [
          "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f", // TXV3_ACCOUNT_CLASS_HASH
        ],
      },
    ]
    expect(getV3UpgradeCall(calls)).toEqual(calls[1])
  })
  it("should return undefined if its not v3 upgrade", () => {
    const calls = [
      {
        contractAddress: "0x0000000000",
        entrypoint: "deploy",
        calldata: [1, 2, 3],
      },
      {
        contractAddress: "0x0000000000",
        entrypoint: "upgrade",
        calldata: [
          "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003", // TXV1_ACCOUNT_CLASS_HASH
        ],
      },
    ]
    expect(getV3UpgradeCall(calls)).toBeUndefined()
  })

  it("should return undefined if there is no upgrade call to v3 ClassHash", () => {
    const calls = [
      {
        contractAddress: "0x0000000000",
        entrypoint: "deploy",
        calldata: [1, 2, 3],
      },
      {
        contractAddress: "0x0000000000",
        entrypoint: "set_implementation",
        calldata: [
          "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f", // TXV3_ACCOUNT_CLASS_HASH
        ],
      },
    ]
    expect(getV3UpgradeCall(calls)).toBeUndefined()
  })

  it("should work with BigInt ClassHash", () => {
    const calls = [
      {
        contractAddress: "0x0000000000",
        entrypoint: "deploy",
        calldata: [1, 2, 3],
      },
      {
        contractAddress: "0x0000000000",
        entrypoint: "upgrade",
        calldata: [
          1527385455757960447222183650373907436110918566631056279654792814069834683007n, // num.toBigInt(TXV3_ACCOUNT_CLASS_HASH)
        ],
      },
    ]
    expect(getV3UpgradeCall(calls)).toEqual(calls[1])
  })
})
