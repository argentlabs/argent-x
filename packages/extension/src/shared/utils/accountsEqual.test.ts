import { describe, it, expect } from "vitest"
import { accountsEqual } from "./accountsEqual"

describe("accountsEqual", () => {
  const accountA = {
    address:
      "0x4da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1",
    cairoVersion: "1",
    classHash:
      "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b",
    name: "Account 1",
    needsDeploy: false,
    networkId: "mainnet-alpha",
    provisionAmount: "111100000000000000000",
    provisionDate: 1709128880978,
    signer: {
      derivationPath: "m/44'/9004'/0'/0/0",
      type: "local_secret",
    },
    type: "standard",
  }

  const accountB = {
    address:
      "0x04da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1",
    classHash:
      "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b",
    id: "0x04da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1::mainnet-alpha::local_secret::0",
    name: "Account 1",
    needsDeploy: false,
    networkId: "mainnet-alpha",
    signer: {
      derivationPath: "m/44'/9004'/0'/0/0",
      type: "local_secret",
    },
    type: "standard",
  }

  it("should return true for accounts with the same id", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(accountA, accountB)).toBe(true)
  })

  it("should return true for accounts with the same address and networkId", () => {
    const accountC = {
      address:
        "0x4da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1",
      networkId: "mainnet-alpha",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: "local_secret",
      },
    }

    const accountD = {
      address:
        "0x4da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1",
      networkId: "mainnet-alpha",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: "local_secret",
      },
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(accountC, accountD)).toBe(true)
  })

  it("should return true for accounts that determine same id", () => {
    const accountE = {
      id: "0x04da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1::mainnet-alpha::local_secret::1",
      address:
        "0x4da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1",
      networkId: "mainnet-alpha",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: "local_secret",
      },
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(accountA, accountE)).toBe(true)
  })

  it("should return false for accounts with different addresses", () => {
    const accountF = {
      id: "0x04da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1::mainnet-alpha::local_secret::0",
      address: "0x456",
      networkId: "mainnet-alpha",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: "local_secret",
      },
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(accountA, accountF)).toBe(false)
  })

  it("should return false for accounts with different networkIds", () => {
    const accountG = {
      id: "0x04da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1::mainnet-alpha::local_secret::0",
      address:
        "0x4da6b031d730282c1861e6f72c3dcecb063d7d90f27c9bafab980c5c8f0ccc1",
      networkId: "testnet",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: "local_secret",
      },
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(accountA, accountG)).toBe(false)
  })

  it("should return false if one of the accounts is undefined", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(accountA, undefined)).toBe(false)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(accountsEqual(undefined, accountB)).toBe(false)
  })

  it("should return false if both accounts are undefined", () => {
    expect(accountsEqual(undefined, undefined)).toBe(false)
  })
})
