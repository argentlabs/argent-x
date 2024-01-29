import { describe, expect, test } from "vitest"

import { getNextPathIndex } from "./derivationPath"
import { STANDARD_DERIVATION_PATH } from "../wallet.service"

describe("getNextPathIndex", () => {
  test("incrementing", () => {
    expect(
      getNextPathIndex(
        ["m/44'/9004'/0'/0/0", "m/44'/9004'/0'/0/1", "m/44'/9004'/0'/0/2"],
        STANDARD_DERIVATION_PATH,
      ),
    ).toBe(3)
  })

  test("fill incrementing gap", () => {
    expect(
      getNextPathIndex(
        ["m/44'/9004'/0'/0/0", "m/44'/9004'/0'/0/1", "m/44'/9004'/0'/0/3"],
        STANDARD_DERIVATION_PATH,
      ),
    ).toBe(2)
  })

  test("fill big gap", () => {
    expect(
      getNextPathIndex(
        ["m/44'/9004'/0'/0/0", "m/44'/9004'/0'/0/4", "m/44'/9004'/0'/0/11"],
        STANDARD_DERIVATION_PATH,
      ),
    ).toBe(1)
  })

  test("fill 0 gap", () => {
    expect(
      getNextPathIndex(
        ["m/44'/9004'/0'/0/3", "m/44'/9004'/0'/0/1"],
        STANDARD_DERIVATION_PATH,
      ),
    ).toBe(0)
  })

  test("legacy gets ignored", () => {
    expect(
      getNextPathIndex(
        [
          "m/2645'/1195502025'/1148870696'/0'/0'/0",
          "m/2645'/1195502025'/1148870696'/0'/0'/1",
        ],
        STANDARD_DERIVATION_PATH,
      ),
    ).toBe(0)
  })

  test("can still add legacy paths to mixed array", () => {
    expect(
      getNextPathIndex(
        [
          "m/2645'/1195502025'/1148870696'/0'/0'/0",
          "m/2645'/1195502025'/1148870696'/0'/0'/1",
          "m/44'/9004'/0'/0/0",
          "m/44'/9004'/0'/0/1",
          "m/44'/9004'/0'/0/2",
        ],
        "m/2645'/1195502025'/1148870696'/0'/0'",
      ),
    ).toBe(2)
  })

  test("empty array", () => {
    expect(getNextPathIndex([], STANDARD_DERIVATION_PATH)).toBe(0)
  })
})
