import { SequencerProvider } from "starknet"
import { uint256 } from "starknet"
import { beforeAll, describe, expect, test } from "vitest"

import { Multicall } from ".."

describe.each([
  // {
  //   // Test with default provider on testnet2 and default multicall contract address
  //   baseUrl: "https://alpha4-2.starknet.io/",
  //   multicallAddress: undefined,
  // },
  {
    // Test with default provider on testnet2 and not deployed multicall contract address (should fallback to one request per call)
    baseUrl: "https://alpha4-2.starknet.io/",
    multicallAddress: "0xdead",
  },
])(
  "Multicall with address $multicallAddress",
  ({ baseUrl, multicallAddress }) => {
    let mc: Multicall
    beforeAll(() => {
      mc = new Multicall(
        new SequencerProvider({
          baseUrl,
        }),
        multicallAddress,
        {
          batchInterval: 10, // 10ms
        },
      )
    })

    test("should aggregate multiple calls into one multicall", async () => {
      const results = await Promise.all([
        // promises resolve at the same time as they use multicall contract
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "balanceOf",
          calldata: [
            "0x04a79cA7FDE3dd9C5CBadcBDCB39f95A0619da26767af0B52fD0901cd556a035".toLowerCase(),
          ],
        }),
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "balanceOf",
          calldata: [
            "0x0472eb42746E4b7b426B6DC45B9ac0345bA38502d0928209016F8a1323330CF4".toLowerCase(),
          ],
        }),
      ])

      for (const result of results) {
        const [low, high] = result
        const balance = uint256.uint256ToBN({ low, high })
        expect(balance > 0).toBeTruthy()
      }
    })
    test("should partially error with a single error", async () => {
      const results = await Promise.allSettled([
        // promises resolve at the same time as they use multicall contract
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "balanceOf",
          calldata: [
            "0x0472eb42746E4b7b426B6DC45B9ac0345bA38502d0928209016F8a1323330CF4".toLowerCase(),
          ],
        }),
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "get_balance", // this will fail
          calldata: [
            "0x04a79cA7FDE3dd9C5CBadcBDCB39f95A0619da26767af0B52fD0901cd556a035".toLowerCase(),
          ],
        }),
      ])

      expect(results.map((x) => x.status)).toMatchInlineSnapshot(`
      [
        "fulfilled",
        "rejected",
      ]
    `)
    })
    test("should partially error with multiple errors", async () => {
      const results = await Promise.allSettled([
        // promises resolve at the same time as they use multicall contract
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "get_balance", // this will fail
          calldata: [
            "0x0472eb42746E4b7b426B6DC45B9ac0345bA38502d0928209016F8a1323330CF4".toLowerCase(),
          ],
        }),
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "balanceOf",
          calldata: [
            "0x0472eb42746E4b7b426B6DC45B9ac0345bA38502d0928209016F8a1323330CF4".toLowerCase(),
          ],
        }),
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "get_balance", // this will fail
          calldata: [
            "0x04a79cA7FDE3dd9C5CBadcBDCB39f95A0619da26767af0B52fD0901cd556a035".toLowerCase(),
          ],
        }),
      ])

      expect(results.map((x) => x.status)).toMatchInlineSnapshot(`
      [
        "rejected",
        "fulfilled",
        "rejected",
      ]
    `)
    })
    test("should error when all fail", async () => {
      const results = await Promise.allSettled([
        // promises resolve at the same time as they use multicall contract
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "get_balance", // this will fail
          calldata: [
            "0x0472eb42746E4b7b426B6DC45B9ac0345bA38502d0928209016F8a1323330CF4".toLowerCase(),
          ],
        }),
        mc.call({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "get_balance", // this will fail
          calldata: [
            "0x04a79cA7FDE3dd9C5CBadcBDCB39f95A0619da26767af0B52fD0901cd556a035".toLowerCase(),
          ],
        }),
      ])

      expect(results.map((x) => x.status)).toMatchInlineSnapshot(`
      [
        "rejected",
        "rejected",
      ]
    `)
    })
  },
)
