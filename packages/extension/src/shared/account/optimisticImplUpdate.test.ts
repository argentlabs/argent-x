import { getMockWalletAccount } from "../../../test/walletAccount.mock"
import { optimisticImplUpdate } from "./optimisticImplUpdate"
import { ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES } from "./starknet.constants"

describe("optimisticImplUpdate", () => {
  it("should return the account if newClassHash is not defined", () => {
    const account = getMockWalletAccount()
    const newClassHash = undefined
    const result = optimisticImplUpdate(account, newClassHash)
    expect(result).toEqual(account)
  })
  it("should return the account with the new class hash and the cairo version 1 if newClassHash is in CAIRO_1", () => {
    const account = getMockWalletAccount({
      classHash: ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_0[0],
      cairoVersion: "0",
    })
    const newClassHash = ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1[0]
    const result = optimisticImplUpdate(account, newClassHash)
    expect(result).toEqual({
      ...account,
      classHash: newClassHash,
      cairoVersion: "1",
    })
  })
  it("should return the account with the new class hash and the cairo version 0 if newClassHash is in CAIRO_0", () => {
    const account = getMockWalletAccount({
      classHash: ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1[0],
      cairoVersion: "1",
    })
    const newClassHash = ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_0[0]
    const result = optimisticImplUpdate(account, newClassHash)
    expect(result).toEqual({
      ...account,
      classHash: newClassHash,
      cairoVersion: "0",
    })
  })
  it("should return the account with the new class hash and the current cairo version if newClassHash is not in CAIRO_1 or CAIRO_0", () => {
    const account = getMockWalletAccount({
      classHash: "0x123",
      cairoVersion: "1",
    })
    const newClassHash = "0xabc"
    const result = optimisticImplUpdate(account, newClassHash)
    expect(result).toEqual({
      ...account,
      classHash: newClassHash,
      cairoVersion: "1",
    })
  })
})
