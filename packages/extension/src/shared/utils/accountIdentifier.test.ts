import {
  deserializeAccountIdentifier,
  getAccountIdentifier,
} from "./accountIdentifier"
import type { WalletAccountSigner } from "../wallet.model"
import { accountIdSchema, SignerType } from "../wallet.model"
import { addressSchema } from "@argent/x-shared"

describe("accountIdentifier", () => {
  describe("getAccountIdentifier", () => {
    const mockSigner: WalletAccountSigner = {
      type: SignerType.LOCAL_SECRET,
      derivationPath: "m/44'/60'/0'/0/0",
    }
    const addr =
      "0x50bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768"
    const networkId = "sepolia-alpha"

    it("should return the correct account identifier with parsing", () => {
      vi.spyOn(addressSchema, "parse")
      const result = getAccountIdentifier(addr, networkId, mockSigner)
      expect(result).toBe(
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::sepolia-alpha::local_secret::0",
      )
      expect(addressSchema.parse).toHaveBeenCalledWith(addr)
      expect(accountIdSchema.parse(result)).toBeTruthy()
    })

    it("should return the correct account identifier without parsing", () => {
      vi.spyOn(addressSchema, "parse")
      const result = getAccountIdentifier(addr, networkId, mockSigner, false)
      expect(result).toBe(
        "0x50bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::sepolia-alpha::local_secret::0",
      )
      expect(addressSchema.parse).not.toHaveBeenCalled()
      expect(accountIdSchema.parse(result)).toBeTruthy()
    })

    it("should fail with zero address", () => {
      vi.spyOn(addressSchema, "parse")
      const addr = "0x0"
      expect(() =>
        getAccountIdentifier(addr, networkId, mockSigner),
      ).toThrowError()
      expect(addressSchema.parse).toHaveBeenCalledWith(addr)
    })

    it("should pass with zero address if parsing is disabled", () => {
      // This case is required when creating smart accounts because we don't know the address
      // in advance.
      vi.spyOn(addressSchema, "parse")
      const addr = "0x0"
      const result = getAccountIdentifier(addr, networkId, mockSigner, false)
      expect(result).toBe("0x0::sepolia-alpha::local_secret::0")
      expect(addressSchema.parse).not.toHaveBeenCalled()
      expect(accountIdSchema.parse(result)).toBeTruthy()
    })

    it("should handle different network IDs", () => {
      const networkId = "mainnet-alpha"
      const result = getAccountIdentifier(addr, networkId, mockSigner)
      expect(result).toBe(
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::mainnet-alpha::local_secret::0",
      )
      expect(accountIdSchema.parse(result)).toBeTruthy()
    })

    it("should handle different signer types", () => {
      const networkId = "mainnet-alpha"
      const customSigner = { ...mockSigner, type: SignerType.LEDGER }
      const result = getAccountIdentifier(addr, networkId, customSigner)
      expect(result).toBe(
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::mainnet-alpha::ledger::0",
      )
      expect(accountIdSchema.parse(result)).toBeTruthy()
    })
  })

  describe("deserializeAccountIdentifier", () => {
    it("should correctly deserialize a valid account identifier", () => {
      const accountId =
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::sepolia-alpha::local_secret::0"
      const result = deserializeAccountIdentifier(accountId)

      expect(result).toEqual({
        address:
          "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768",
        networkId: "sepolia-alpha",
        signer: {
          type: SignerType.LOCAL_SECRET,
          index: 0,
        },
      })
    })

    it("should handle different network IDs", () => {
      const accountId =
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::mainnet-alpha::local_secret::0"
      const result = deserializeAccountIdentifier(accountId)

      expect(result.networkId).toBe("mainnet-alpha")
    })

    it("should handle different signer types", () => {
      const accountId =
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::sepolia-alpha::ledger::0"
      const result = deserializeAccountIdentifier(accountId)

      expect(result.signer.type).toBe(SignerType.LEDGER)
    })

    it("should handle different signer indices", () => {
      const accountId =
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::sepolia-alpha::local_secret::5"
      const result = deserializeAccountIdentifier(accountId)

      expect(result.signer.index).toBe(5)
    })

    it("should throw an error for invalid account identifiers", () => {
      const invalidAccountId =
        "0x050bdb26374ba0dace3dba7243328df82fed8cdfa698d89992d06cdd520ab768::sepolia-alpha::local_secret"

      expect(() => deserializeAccountIdentifier(invalidAccountId)).toThrowError(
        "Invalid account identifier",
      )
    })
  })
})
