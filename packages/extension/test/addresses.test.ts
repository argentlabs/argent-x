import { describe, expect, test } from "vitest"

import { addressSchema, isEqualAddress } from "../src/ui/services/addresses"

describe("address input", () => {
  test("should not allow ethereum addresses", async () => {
    const address = "0x396fdfecf39613d444466b79f2acf14330c06a07"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(false)
  })
  test("should not allow zero address", async () => {
    const address =
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(false)
  })
  test("should allow valid 64 chars starknet address", async () => {
    const address =
      "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(true)
  })
  test("should allow valid 63 chars starknet address", async () => {
    const address =
      "0x33d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(true)
  })
  test("should not allow 62 chars starknet address", async () => {
    const address =
      "0x3d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(false)
  })
  test("should allow valid checksum starknet address", async () => {
    const address =
      "0x033d2A165d2a2ae64CBaf8e6Dff7F0C1974D0f41CD4F0c24D273373d4837bcFd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(true)
  })
  test("should not allow invalid starknet address", async () => {
    const address =
      "0x033D2A165d2a2aE64cBaF8e6DFF7F0c1974d0f41cD4F0c24d273373D4837BcFd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(false)
  })
})

describe("isEqualAddress", () => {
  describe("when valid", () => {
    test("should match same address", () => {
      expect(
        isEqualAddress(
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
        ),
      ).toBe(true)
    })
    test("should match same address regardless of zero padding", () => {
      expect(
        isEqualAddress(
          "0x33d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
        ),
      ).toBe(true)
      expect(
        isEqualAddress(
          "33d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
        ),
      ).toBe(true)
    })
    test("should match regardless of case", () => {
      expect(
        isEqualAddress(
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033D2A165D2A2AE64CBAF8E6DFF7F0C1974D0F41CD4F0C24D273373D4837BCFD",
        ),
      ).toBe(true)
    })
  })
  describe("when invalid", () => {
    test("should return false without throwing", () => {
      expect(
        isEqualAddress(
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "foo",
        ),
      ).toBe(false)
      expect(isEqualAddress("foo", "foo")).toBe(false)
    })
  })
})
