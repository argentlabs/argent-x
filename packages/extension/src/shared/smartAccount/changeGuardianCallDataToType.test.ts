import {
  ChangeGuardian,
  changeGuardianCalldataToType,
} from "./changeGuardianCallDataToType"
import { expect, test, describe } from "vitest"
import { getChangeGuardianCalldata } from "./getChangeGuardianCalldata"
import { constants } from "starknet"

describe("smartAccount/changeGuardianCallDataToType", () => {
  describe("changeGuardianCallDataToType", () => {
    describe("when adding", () => {
      test("returns ADDING", () => {
        expect(
          changeGuardianCalldataToType(
            getChangeGuardianCalldata({
              supportsMultiSigner: false,
              guardian: "0x123",
            }),
          ),
        ).toEqual(ChangeGuardian.ADDING)
        expect(
          changeGuardianCalldataToType(
            getChangeGuardianCalldata({
              supportsMultiSigner: true,
              guardian: "0x123",
            }),
          ),
        ).toEqual(ChangeGuardian.ADDING)
      })
    })
    describe("when removing", () => {
      test("returns REMOVING", () => {
        expect(
          changeGuardianCalldataToType(
            getChangeGuardianCalldata({
              supportsMultiSigner: false,
              guardian: constants.ZERO.toString(),
            }),
          ),
        ).toEqual(ChangeGuardian.REMOVING)
        expect(
          changeGuardianCalldataToType(
            getChangeGuardianCalldata({
              supportsMultiSigner: true,
              guardian: constants.ZERO.toString(),
            }),
          ),
        ).toEqual(ChangeGuardian.REMOVING)
      })
    })
    describe("when empty", () => {
      test("returns NONE", () => {
        expect(changeGuardianCalldataToType([])).toEqual(ChangeGuardian.NONE)
        expect(changeGuardianCalldataToType()).toEqual(ChangeGuardian.NONE)
      })
    })
  })
})
