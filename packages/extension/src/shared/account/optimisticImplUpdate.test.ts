import { getMockWalletAccount } from "../../../test/walletAccount.mock"
import {
  getLastCairo0ArgentAccountClassHash,
  getLatestArgentAccountClassHash,
} from "@argent/x-shared"
import { optimisticImplUpdate } from "./optimisticImplUpdate"

describe("optimisticImplUpdate", () => {
  it("should return the account if newClassHash is not defined", () => {
    const account = getMockWalletAccount()
    const newClassHash = undefined
    const result = optimisticImplUpdate(account, newClassHash)
    expect(result).toEqual(account)
  })
  it("should return the account with the new class hash and the cairo version 1 if newClassHash is in CAIRO_1", () => {
    const account = getMockWalletAccount({
      classHash: getLastCairo0ArgentAccountClassHash(),
      cairoVersion: "0",
    })
    const newClassHash = getLatestArgentAccountClassHash()
    const result = optimisticImplUpdate(account, newClassHash)
    expect(result).toEqual({
      ...account,
      classHash: newClassHash,
      cairoVersion: "1",
    })
  })
  it("should return the account with the new class hash and the cairo version 0 if newClassHash is in CAIRO_0", () => {
    const account = getMockWalletAccount({
      classHash: getLatestArgentAccountClassHash(),
      cairoVersion: "1",
    })
    const newClassHash = getLastCairo0ArgentAccountClassHash()
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
