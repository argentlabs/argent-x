import { describe, expect, it } from "vitest"

import { getSortedAccounts } from "./useSortedAccounts"

import { mockAccounts } from "./AccountListHiddenScreen.test"

vi.mock("./accounts.state", () => {
  return {
    useWalletAccount: vi.fn(),
    mapWalletAccountsToAccounts: vi.fn(() => mockAccounts),
  }
})

vi.mock("./usePartitionedAccountsByType", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...actual,
    usePartitionedAccountsByType: vi.fn(() => ({
      multisigAccounts: [mockAccounts[1]],
      standardAccounts: [mockAccounts[0], mockAccounts[2], mockAccounts[3]],
      importedAccounts: [],
    })),
  }
})

describe("sortedAccounts", () => {
  it("Renders accounts in the correct order", () => {
    const sortedAccounts = getSortedAccounts(mockAccounts)

    const accountNames = sortedAccounts.map((account) => account.name)

    const expectedOrder = [
      "Account 1 Lorem Ipsum Dolor Sit Amet",
      "Account 2 Lorem Ipsum Dolor Sit Amet",
      "Account 3 Lorem Ipsum Dolor Sit Amet",
      "Multisig 3 Lorem Ipsum Dolor Sit Amet",
    ]

    expect(accountNames).toEqual(expectedOrder)
  })
})
