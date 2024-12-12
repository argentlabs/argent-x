import { describe, it, expect, vi, beforeEach } from "vitest"
import { NonceManagementService } from "./NonceManagementService"
import type { AccountId } from "../../shared/wallet.model"
import { AccountError } from "../../shared/errors/account"

// Mock dependencies
const mockNonceStore = {
  get: vi.fn(),
  set: vi.fn(),
}

const mockAccountSharedService = {
  getAccount: vi.fn(),
}

const mockAccountStarknetService = {
  getStarknetAccount: vi.fn(),
}

const mockMultisigBackendService = {
  fetchMultisigTransactionRequests: vi.fn(),
}

describe("NonceManagementService", () => {
  let nonceManagementService: NonceManagementService

  beforeEach(() => {
    vi.clearAllMocks()
    nonceManagementService = new NonceManagementService(
      mockNonceStore as any,
      mockAccountSharedService as any,
      mockAccountStarknetService as any,
      mockMultisigBackendService as any,
    )
  })

  describe("getNonce", () => {
    it("should throw AccountError if account is not found", async () => {
      const accountId = "0x123" as AccountId
      mockAccountSharedService.getAccount.mockResolvedValue(null)

      await expect(nonceManagementService.getNonce(accountId)).rejects.toThrow(
        AccountError,
      )
    })

    it("should return local nonce if it is greater than or equal to onchain nonce", async () => {
      const accountId = "0x123" as AccountId
      const localNonce = "0x5"
      const onchainNonce = BigInt(4)

      mockAccountSharedService.getAccount.mockResolvedValue({
        type: "standard",
      })
      mockNonceStore.get.mockResolvedValue({
        local: { [accountId]: localNonce },
      })
      mockAccountStarknetService.getStarknetAccount.mockResolvedValue({
        getNonce: vi.fn().mockResolvedValue(onchainNonce),
      })

      const result = await nonceManagementService.getNonce(accountId)
      expect(result).toBe(localNonce)
    })

    it("should return onchain nonce if local nonce is lower", async () => {
      const accountId = "0x123" as AccountId
      const localNonce = "0x3"
      const onchainNonce = BigInt(4)

      mockAccountSharedService.getAccount.mockResolvedValue({
        type: "standard",
      })
      mockNonceStore.get.mockResolvedValue({
        local: { [accountId]: localNonce },
      })
      mockAccountStarknetService.getStarknetAccount.mockResolvedValue({
        getNonce: vi.fn().mockResolvedValue(onchainNonce),
      })

      const result = await nonceManagementService.getNonce(accountId)
      expect(result).toBe("0x04")
    })

    it("should handle multisig accounts", async () => {
      const accountId = "0x123" as AccountId
      const onchainNonce = BigInt(4)

      mockAccountSharedService.getAccount.mockResolvedValue({
        type: "multisig",
      })
      mockNonceStore.get.mockResolvedValue({ local: {} })
      mockAccountStarknetService.getStarknetAccount.mockResolvedValue({
        getNonce: vi.fn().mockResolvedValue(onchainNonce),
      })
      mockMultisigBackendService.fetchMultisigTransactionRequests.mockResolvedValue(
        {
          content: [{ nonce: 5 }, { nonce: 6 }],
        },
      )

      const result = await nonceManagementService.getNonce(accountId)
      expect(result).toBe("0x07")
    })
  })

  describe("increaseLocalNonce", () => {
    it("should increase local nonce by 1", async () => {
      const accountId = "0x123" as AccountId
      const initialNonce = "0x5"

      mockNonceStore.get.mockResolvedValue({
        local: { [accountId]: initialNonce },
      })

      await nonceManagementService.increaseLocalNonce(accountId)

      expect(mockNonceStore.set).toHaveBeenCalledWith({
        local: { [accountId]: "0x06" },
      })
    })

    it("should not increase nonce if no local nonce exists", async () => {
      const accountId = "0x123" as AccountId

      mockNonceStore.get.mockResolvedValue({ local: {} })

      await nonceManagementService.increaseLocalNonce(accountId)

      expect(mockNonceStore.set).not.toHaveBeenCalled()
    })
  })

  describe("resetLocalNonce", () => {
    it("should reset local nonce", async () => {
      const accountId = "0x123" as AccountId

      mockNonceStore.get.mockResolvedValue({ local: { [accountId]: "0x5" } })

      await nonceManagementService.resetLocalNonce(accountId)

      expect(mockNonceStore.set).toHaveBeenCalledWith({
        local: {},
      })
    })
  })
})
