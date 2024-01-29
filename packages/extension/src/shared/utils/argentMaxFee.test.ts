import { modifySnjsFeeOverhead } from "./argentMaxFee"
import { num } from "starknet"

describe("argentMaxFee function tests", () => {
  const SCALE = 10
  const SCALED_MULTIPLIER = 1.5 * SCALE
  test.each([
    ["100", 1.5],
    ["100", 2],
    ["100", 10],
    ["100", 0.5],
  ])(
    "given suggestedFee %s and overheadMultiplier %f should return the expected value",
    (suggestedFee, overheadMultiplier) => {
      let suggestedMaxFeeBigInt = num.toBigInt(suggestedFee)
      suggestedMaxFeeBigInt =
        (suggestedMaxFeeBigInt * BigInt(SCALE)) / BigInt(SCALED_MULTIPLIER)
      suggestedMaxFeeBigInt =
        (suggestedMaxFeeBigInt * BigInt(overheadMultiplier * SCALE)) /
        BigInt(SCALE)
      const expectedFee = num.toHex(suggestedMaxFeeBigInt)
      expect(
        modifySnjsFeeOverhead({
          suggestedMaxFee: num.toBigInt(suggestedFee),
          overheadMultiplier: overheadMultiplier,
        }),
      ).toBe(expectedFee)
    },
  )

  test.each([
    ["100", 1.5, 1, "150"],
    ["100", 2, 1, "200"],
    ["100", 10, 1, "1000"],
    ["100", 0.5, 1, "50"],
    ["1000000000", 5, 1, "5000000000"],
  ])(
    "given suggestedFee %s overheadMultiplier %f and default multiplier %f should return %s",
    (suggestedFee, overheadMultiplier, snjsMultiplier, expectedHex) => {
      expect(
        modifySnjsFeeOverhead({
          suggestedMaxFee: num.toBigInt(suggestedFee),
          overheadMultiplier,
          starknetJsOverheadMultiplier: snjsMultiplier,
        }),
      ).toBe(num.toHex(expectedHex))
    },
  )
})
