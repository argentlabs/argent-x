import { describe, expect, it, vi } from "vitest"

import { Network } from "../../network"
import { defaultNetworks } from "../../network/defaults"
import {
  SignerType,
  type StoredWalletAccount,
  type WalletAccount,
} from "../../wallet.model"
import { deserializeFactory, migrateAccount, serialize } from "./serialize"

const defaultNetwork = defaultNetworks[1]

// Mock getNetwork function
const getNetwork = vi.fn(async (networkId): Promise<Network> => {
  if (networkId !== defaultNetwork.id) {
    return undefined as unknown as Network
  }
  return defaultNetwork
})

const deserialize = deserializeFactory(getNetwork)

const mockAccounts: WalletAccount[] = [
  {
    name: "Account1",
    type: "standard",
    address: "0x1",
    signer: { derivationPath: "1", type: SignerType.LOCAL_SECRET },
    networkId: "sepolia-alpha",
    network: defaultNetwork,
  },
]

const mockStoredAccounts: StoredWalletAccount[] = [
  {
    name: "Account1",
    type: "standard",
    address: "0x1",
    signer: { derivationPath: "1", type: SignerType.LOCAL_SECRET },
    networkId: "sepolia-alpha",
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

  it("Should filter out accounts with invalid networkId", async () => {
    const invalidStoredAccounts: StoredWalletAccount[] = [
      ...mockStoredAccounts,
      {
        name: "Account2",
        type: "standard",
        address: "0x2",
        signer: { derivationPath: "1", type: SignerType.LOCAL_SECRET },
        networkId: "sepolia-beta",
      },
    ]

    const deserializedAccounts = await deserialize(invalidStoredAccounts)
    expect(deserializedAccounts).toEqual(mockAccounts)
  })
})

describe("Wallet Account Migration", () => {
  it("Should correctly migrate argent accounts to standard accounts", () => {
    const argentAccount: WalletAccount = {
      name: "Account1",
      // @ts-expect-error This is a migration, so we can ignore the type error
      type: "argent",
      address: "0x1",
      signer: { derivationPath: "1", type: SignerType.LOCAL_SECRET },
      networkId: "sepolia-alpha",
      network: defaultNetwork,
    }

    const migratedAccount = migrateAccount(argentAccount)
    expect(migratedAccount.type).toEqual("standard")
  })
})
