import { describe, expect, test } from "vitest"

import { WalletAccount } from "../wallet.model"
import { BackendAccount } from "./backend/account"
import {
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
  getLocalAccountsMatchBackendAccounts,
  validateEmailForAccounts,
} from "./validation"

describe("shield/validation", () => {
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
            address: "0x123",
          },
        ] as WalletAccount[]
        const backendAccounts = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
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
          ).toThrowError(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1)
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
          ).toThrowError(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2)
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
          ).toThrowError(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3)
        })
      })
    })
  })
})
