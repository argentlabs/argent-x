import { describe, expect, test } from "vitest"

import { WalletAccount } from "../../wallet.model"
import { BackendAccount } from "./../backend/account"
import {
  getLocalAccountsMatchBackendAccounts,
  getShieldValidationErrorFromBackendError,
  validateEmailForAccounts,
} from "./validateAccount"
import {
  ArgentAccountError,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
} from "../../errors/argentAccount"
import { BaseError } from "../../errors/baseError"

describe("shield/validation", () => {
  describe("getShieldValidationErrorFromBackendError", () => {
    describe("when valid", () => {
      describe("and error contains a Shield validation error", () => {
        test("should return the enum", () => {
          expect(
            getShieldValidationErrorFromBackendError({
              data: {
                name: ArgentAccountError.name,
                code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
              },
            }),
          ).toEqual(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1)
          expect(
            getShieldValidationErrorFromBackendError({
              data: {
                name: ArgentAccountError.name,
                code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
              },
            }),
          ).toEqual(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2)
          expect(
            getShieldValidationErrorFromBackendError({
              data: {
                name: ArgentAccountError.name,
                code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
              },
            }),
          ).toEqual(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3)
        })
      })
      describe("and error does not contain a Shield validation error", () => {
        test("should return undefined", () => {
          expect(
            getShieldValidationErrorFromBackendError(new Error()),
          ).toBeNull()
        })
        test("should return null", () => {
          expect(
            getShieldValidationErrorFromBackendError({
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
        expect(getShieldValidationErrorFromBackendError()).toBeNull()
        expect(getShieldValidationErrorFromBackendError(null)).toBeNull()
        expect(getShieldValidationErrorFromBackendError("")).toBeNull()
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
              code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
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
              code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
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
              code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
            }),
          )
        })
      })
    })
  })
})
