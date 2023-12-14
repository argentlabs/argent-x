import { constants } from "starknet"
import { encodeChainId } from "./encodeChainId"

describe("encodeDomainChainId", () => {
  test("should return undefined if domainChainId is undefined", () => {
    expect(encodeChainId(undefined)).toBe(undefined)
  })

  test("should return 0x1 if domainChainId is 1", () => {
    expect(encodeChainId(1)).toBe("0x1")
  })

  test("should 0x534e5f4d41494e if domainChainId is SN_MAIN", () => {
    expect(encodeChainId("SN_MAIN")).toBe("0x534e5f4d41494e")
    expect(encodeChainId("SN_MAIN")).toBe(constants.StarknetChainId.SN_MAIN)
  })

  test("should return 0x534e5f474f45524c49 if domainChainId is SN_GOERLI", () => {
    expect(encodeChainId("SN_GOERLI")).toBe("0x534e5f474f45524c49")
    expect(encodeChainId("SN_GOERLI")).toBe(constants.StarknetChainId.SN_GOERLI)
  })

  test("should return 0x534e5f4d41494e if domainChainId is 0x534e5f4d41494e", () => {
    expect(encodeChainId("0x534e5f4d41494e")).toBe(
      constants.StarknetChainId.SN_MAIN,
    )
  })

  test("should return 0x534e5f474f45524c49 if domainChainId is 0x534e5f474f45524c49", () => {
    expect(encodeChainId(constants.StarknetChainId.SN_GOERLI)).toBe(
      "0x534e5f474f45524c49",
    )
  })
})
