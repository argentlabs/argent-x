import type { BackendAccount } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"
import { describe, expect, test } from "vitest"

import {
  ArgentAccountError,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
} from "../../errors/argentAccount"
import type { WalletAccount } from "../../wallet.model"
import {
  getLocalAccountsMatchBackendAccounts,
  getSmartAccountValidationErrorFromBackendError,
  validateEmailForAccounts,
} from "./validateAccount"

describe("smartaccount/validation", () => {
  describe("getSmartAccountValidationErrorFromBackendError", () => {
    describe("when valid", () => {
      describe("and error contains a SmartAccount validation error", () => {
        test("should return the enum", () => {
          expect(
            getSmartAccountValidationErrorFromBackendError({
              data: {
                name: ArgentAccountError.name,
                code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
              },
            }),
          ).toEqual(SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1)
          expect(
            getSmartAccountValidationErrorFromBackendError({
              data: {
                name: ArgentAccountError.name,
                code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
              },
            }),
          ).toEqual(SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2)
          expect(
            getSmartAccountValidationErrorFromBackendError({
              data: {
                name: ArgentAccountError.name,
                code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
              },
            }),
          ).toEqual(SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_3)
        })
      })
      describe("and error does not contain a SmartAccount validation error", () => {
        test("should return undefined", () => {
          expect(
            getSmartAccountValidationErrorFromBackendError(new Error()),
          ).toBeNull()
        })
        test("should return null", () => {
          expect(
            getSmartAccountValidationErrorFromBackendError({
              data: {
                name: BaseError.name,
                code: "something that does not exists",
              },
            }),
          ).toBeNull()
        })
      })
    })
    describe("when invalid", () => {
      test("should return null", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getSmartAccountValidationErrorFromBackendError()).toBeNull()
        expect(getSmartAccountValidationErrorFromBackendError(null)).toBeNull()
        expect(getSmartAccountValidationErrorFromBackendError("")).toBeNull()
      })
    })
  })
  describe("getLocalAccountsMatchBackendAccounts", () => {
    describe("when accounts do not exist in backend", () => {
      test("should return true", () => {
        const localAccounts = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        const backendAccounts = [] as BackendAccount[]
        expect(
          getLocalAccountsMatchBackendAccounts(localAccounts, backendAccounts),
        ).toBeTruthy()
      })
    })
    describe("when accounts exist and match in backend", () => {
      test("should return true", () => {
        const localAccounts = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        const backendAccounts = [
          {
            address: "0x123",
          },
        ] as BackendAccount[]
        expect(
          getLocalAccountsMatchBackendAccounts(localAccounts, backendAccounts),
        ).toBeTruthy()
      })
    })
    describe("when accounts exist but do not match in backend", () => {
      test("should return false", () => {
        const localAccounts = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        const backendAccounts = [
          {
            address: "0x567",
          },
        ] as BackendAccount[]
        expect(
          getLocalAccountsMatchBackendAccounts(localAccounts, backendAccounts),
        ).toBeFalsy()
      })
    })
  })
  describe("validateEmailForAccounts", () => {
    describe("when accounts do not exist in backend", () => {
      test("should not throw an error", () => {
        const localAccounts = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        const localAccountsWithGuardian = [] as WalletAccount[]
        const backendAccounts = [] as BackendAccount[]
        expect(
          validateEmailForAccounts({
            localAccounts,
            localAccountsWithGuardian,
            backendAccounts,
          }),
        ).toBeUndefined()
      })
    })
    describe("when at least one account matches in backend and locally", () => {
      describe("and there are no guardians locally", () => {
        test("should not throw an error", () => {
          const localAccounts = [
            {
              address: "0x123",
            },
            {
              address: "0x546",
            },
          ] as WalletAccount[]
          const localAccountsWithGuardian = [] as WalletAccount[]
          const backendAccounts = [
            {
              address: "0x321",
            },
            {
              address: "0x546",
            },
            {
              address: "0x567",
            },
          ] as BackendAccount[]
          expect(
            validateEmailForAccounts({
              localAccounts,
              localAccountsWithGuardian,
              backendAccounts,
            }),
          ).toBeUndefined()
        })
      })
      describe("and there are guardians locally", () => {
        test("should not throw an error", () => {
          const localAccounts = [
            {
              address: "0x123",
            },
            {
              address: "0x546",
            },
          ] as WalletAccount[]
          const localAccountsWithGuardian = [
            {
              address: "0x546",
            },
          ] as WalletAccount[]
          const backendAccounts = [
            {
              address: "0x321",
            },
            {
              address: "0x546",
            },
            {
              address: "0x567",
            },
          ] as BackendAccount[]
          expect(
            validateEmailForAccounts({
              localAccounts,
              localAccountsWithGuardian,
              backendAccounts,
            }),
          ).toBeUndefined()
        })
      })
    })
    describe("When there is no 2FA locally", () => {
      describe("and accounts do not match", () => {
        test("Scenario 1: should throw an error", () => {
          const localAccounts = [
            {
              address: "0x123",
            },
            {
              address: "0x321",
            },
          ] as WalletAccount[]
          const localAccountsWithGuardian = [] as WalletAccount[]
          const backendAccounts = [
            {
              address: "0x567",
            },
          ] as BackendAccount[]
          expect(() =>
            validateEmailForAccounts({
              localAccounts,
              localAccountsWithGuardian,
              backendAccounts,
            }),
          ).toThrowError(
            new ArgentAccountError({
              code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
            }),
          )
        })
      })
    })
    describe("When there is 2FA locally", () => {
      describe("and there are no backend accounts (email never used)", () => {
        test("Scenario 2: should throw an error", () => {
          const localAccounts = [
            {
              address: "0x123",
            },
            {
              address: "0x321",
            },
          ] as WalletAccount[]
          const localAccountsWithGuardian = [
            {
              address: "0x123",
            },
          ] as WalletAccount[]
          const backendAccounts = [] as BackendAccount[]
          expect(() =>
            validateEmailForAccounts({
              localAccounts,
              localAccountsWithGuardian,
              backendAccounts,
            }),
          ).toThrowError(
            new ArgentAccountError({
              code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
            }),
          )
        })
      })
      describe("and accounts do not match", () => {
        test("Scenario 3 should throw an error", () => {
          const localAccounts = [
            {
              address: "0x123",
            },
            {
              address: "0x321",
            },
          ] as WalletAccount[]
          const localAccountsWithGuardian = [
            {
              address: "0x123",
            },
          ] as WalletAccount[]
          const backendAccounts = [
            {
              address: "0x567",
            },
          ] as BackendAccount[]
          expect(() =>
            validateEmailForAccounts({
              localAccounts,
              localAccountsWithGuardian,
              backendAccounts,
            }),
          ).toThrowError(
            new ArgentAccountError({
              code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
            }),
          )
        })
      })
    })
  })
})
