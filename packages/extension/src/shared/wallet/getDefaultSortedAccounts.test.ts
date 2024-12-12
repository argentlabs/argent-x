import type { WalletAccount } from "../wallet.model"
import { getDefaultSortedAccounts } from "./getDefaultSortedAccount"

describe("getDefaultSortedAccounts", () => {
  test("should prioritize standard accounts over others", () => {
    const accounts = [
      { type: "smart", index: 1 },
      { type: "standard", index: 2 },
    ] as WalletAccount[]
    const sortedAccounts = getDefaultSortedAccounts(accounts)
    expect(sortedAccounts[0].type).toBe("smart")
    expect(sortedAccounts[1].type).toBe("standard")
  })

  test("should sort accounts of the same type by index", () => {
    const accounts = [
      { type: "standard", index: 2 },
      { type: "standard", index: 1 },
    ] as WalletAccount[]
    const sortedAccounts = getDefaultSortedAccounts(accounts)
    expect(sortedAccounts[0].index).toBe(1)
    expect(sortedAccounts[1].index).toBe(2)
  })

  test("should consider undefined index as the highest value", () => {
    const accounts = [
      { type: "standard", index: undefined },
      { type: "standard", index: 1 },
    ] as WalletAccount[]
    const sortedAccounts = getDefaultSortedAccounts(accounts)
    expect(sortedAccounts[0].index).toBe(1)
    expect(sortedAccounts[1].index).toBeUndefined()
  })

  test("should correctly sort a mix of accounts", () => {
    const accounts = [
      { type: "smart", index: 1 },
      { type: "multisig", index: 1 },
      { type: "standard", index: 3 },
      { type: "standard", index: undefined },
      { type: "smart", index: 2 },
      { type: "standard", index: 4 },
    ] as WalletAccount[]
    const sortedAccounts = getDefaultSortedAccounts(accounts)
    expect(sortedAccounts).toEqual([
      { type: "smart", index: 1 },
      { type: "smart", index: 2 },
      { type: "standard", index: 3 },
      { type: "standard", index: 4 },
      { type: "standard", index: undefined },
      { type: "multisig", index: 1 },
    ])
  })

  test("sorting is stable for accounts with identical sorting criteria", () => {
    const accounts = [
      { type: "standard", index: 1, networkId: "a" },
      { type: "standard", index: 1, networkId: "b" }, // Identical sort criteria to 'a'
    ] as WalletAccount[]
    const sortedAccounts = getDefaultSortedAccounts(accounts)
    expect(sortedAccounts[0].networkId).toBe("a")
    expect(sortedAccounts[1].networkId).toBe("b")
  })
})
