import { describe, expect, test } from "vitest"

import {
  addBackendAccountErrorStatus,
  getAddBackendAccountErrorFromBackendError,
} from "./addBackendAccount"
import { BaseError } from "@argent/x-shared"

describe("smartAccount/error", () => {
  describe("getAddBackendAccountErrorFromBackendError", () => {
    describe("when valid", () => {
      describe("and error contains a recognised error", () => {
        test("should return the associated message", () => {
          expect(
            getAddBackendAccountErrorFromBackendError({
              data: {
                name: BaseError.name,
                message: "accountAlreadyAdded",
              },
            }),
          ).toEqual(addBackendAccountErrorStatus["accountAlreadyAdded"])
          expect(
            getAddBackendAccountErrorFromBackendError({
              data: {
                name: BaseError.name,
                message: "Error: accountAlreadyAdded",
              },
            }),
          ).toEqual(addBackendAccountErrorStatus["accountAlreadyAdded"])
          expect(
            getAddBackendAccountErrorFromBackendError({
              data: {
                name: BaseError.name,
                message: "Error: Error: Error: accountAlreadyAdded",
              },
            }),
          ).toEqual(addBackendAccountErrorStatus["accountAlreadyAdded"])
        })
      })
      describe("and error does not contain a recognised error", () => {
        test("should return null", () => {
          expect(getAddBackendAccountErrorFromBackendError({})).toBeNull()
        })
        test("should return undefined", () => {
          expect(
            getAddBackendAccountErrorFromBackendError({
              data: {
                name: BaseError.name,
                message: "foo",
              },
            }),
          ).toBeUndefined()
        })
      })
    })
    describe("when invalid", () => {
      test("should return null", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getAddBackendAccountErrorFromBackendError()).toBeNull()
        expect(getAddBackendAccountErrorFromBackendError(null)).toBeNull()
        expect(getAddBackendAccountErrorFromBackendError("")).toBeNull()
      })
    })
  })
})
