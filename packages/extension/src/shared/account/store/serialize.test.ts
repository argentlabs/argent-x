import { describe, expect, it, vi } from "vitest"

import { defaultNetwork } from "../../network/defaults"
import type { StoredWalletAccount, WalletAccount } from "../../wallet.model"
import { deserialize, serialize } from "./serialize"

// Mock getNetwork function
vi.mock("../../network", () => ({
  getNetwork: vi.fn((networkId) => {
    expect(networkId).toEqual("goerli-alpha")
    return Promise.resolve(defaultNetwork)
  }),
}))

const mockAccounts: WalletAccount[] = [
  {
    name: "Account1",
    type: "standard",
    address: "0x1",
    signer: { derivationPath: "1", type: "local_secret" },
    networkId: "goerli-alpha",
    network: defaultNetwork,
  },
]

const mockStoredAccounts: StoredWalletAccount[] = [
  {
    name: "Account1",
    type: "standard",
    address: "0x1",
    signer: { derivationPath: "1", type: "local_secret" },
    networkId: "goerli-alpha",
  },
]

describe("Wallet Account Serialization and Deserialization", () => {
  it("Should correctly serialize wallet accounts", () => {
    const serializedAccounts = serialize(mockAccounts)
    expect(serializedAccounts).toEqual(mockStoredAccounts)
  })

  it("Should correctly deserialize stored wallet accounts", async () => {
    const deserializedAccounts = await deserialize(mockStoredAccounts)
    expect(deserializedAccounts).toEqual(mockAccounts)
  })
})
