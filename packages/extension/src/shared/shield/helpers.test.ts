import { describe, expect, test } from "vitest"

import { WalletAccount } from "../wallet.model"
import { BackendAccount } from "./backend/account"
import { checkForEmailInUse, checkForWrongEmail } from "./helpers"

describe("shield/helpers", () => {
  describe("checkForEmailInUse", () => {
    describe("when accounts do not exist in backend", () => {
      test("should not throw an error", () => {
        const backendAccounts = [] as BackendAccount[]
        const accountsOnNetwork = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        expect(
          checkForEmailInUse(backendAccounts, accountsOnNetwork),
        ).toBeUndefined()
      })
    })
    describe("when at least one account matches in backend and locally", () => {
      test("should not throw an error", () => {
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
        const accountsOnNetwork = [
          {
            address: "0x123",
          },
          {
            address: "0x546",
          },
        ] as WalletAccount[]
        expect(
          checkForEmailInUse(backendAccounts, accountsOnNetwork),
        ).toBeUndefined()
      })
    })
    describe("when accounts do not match", () => {
      test("should throw the expected error", () => {
        const backendAccounts = [
          {
            address: "0x123",
          },
        ] as BackendAccount[]
        const accountsOnNetwork = [
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        expect(() =>
          checkForEmailInUse(backendAccounts, accountsOnNetwork),
        ).toThrowErrorMatchingInlineSnapshot(
          '"ARGENT_SHIELD_ERROR_EMAIL_IN_USE"',
        )
      })
    })
  })
  describe("checkForWrongEmail", () => {
    describe("when accounts do not exist in backend", () => {
      test("should throw the exected error", () => {
        const backendAccounts = [] as BackendAccount[]
        const accountsWithGuardian = [
          {
            address: "0x123",
          },
          {
            address: "0x321",
          },
        ] as WalletAccount[]
        expect(() =>
          checkForWrongEmail(backendAccounts, accountsWithGuardian),
        ).toThrowErrorMatchingInlineSnapshot(
          '"ARGENT_SHIELD_ERROR_WRONG_EMAIL"',
        )
      })
    })
    describe("when at least one account exists in backend", () => {
      test("should not throw an error", () => {
        const backendAccounts = [
          {
            address: "0x123",
          },
        ] as BackendAccount[]
        const accountsWithGuardian = [] as WalletAccount[]
        expect(
          checkForWrongEmail(backendAccounts, accountsWithGuardian),
        ).toBeUndefined()
      })
    })
  })
})
