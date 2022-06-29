import { describe, expect, test } from "vitest"

import { addressSchema } from "../src/ui/services/addresses"

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
      "0x033D2A165d2a2aE64cBaF8e6DFF7F0c1974d0f41cD4F0c24d273373D4837BcFd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(true)
  })
  test("should not allow invalid starknet address", async () => {
    const address =
      "0x033d2A165d2a2aE64cBaF8e6DFF7F0c1974d0f41cD4F0c24d273373D4837BcFd"
    const result = await addressSchema.isValid(address)
    expect(result).toBe(false)
  })
})
