import { Call } from "starknet"
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
          "0x29927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b", // TXV3_ACCOUNT_CLASS_HASH
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
          "0x02fadbf77a721b94bdcc3032d86a8921661717fa55145bccf88160ee2a5efcd1", // TXV3_ACCOUNT_CLASS_HASH
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
          1175227876648481476947357169641801659537058431979519277343402598445203099179n, // num.toBigInt(TXV3_ACCOUNT_CLASS_HASH)
        ],
      },
    ]
    expect(getV3UpgradeCall(calls)).toEqual(calls[1])
  })
})
