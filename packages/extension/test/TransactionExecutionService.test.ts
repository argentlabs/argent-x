import { beforeEach, describe, expect, it, vi } from "vitest"
import { TransactionExecutionService } from "../src/background/services/transactionExecution/TransactionExecutionService"
import type { ITransactionsRepository } from "../src/shared/transactions/store"
import type { IEstimatedFeesRepository } from "../src/shared/transactionSimulation/fees/fees.model"
import type { BaseStarknetAccount } from "../src/shared/starknetAccount/base"

import { getMockWalletAccount } from "./walletAccount.mock"
import { SessionError } from "../src/shared/errors/session"
import { AccountError } from "../src/shared/errors/account"
import { TransactionError } from "../src/shared/errors/transaction"
import type { IBackgroundInvestmentService } from "../src/background/services/investments/IBackgroundInvestmentService"
import type { INonceManagementService } from "../src/background/nonceManagement/INonceManagementService"
import type { Wallet } from "../src/background/wallet"
import { getMockPaymasterFee, getMockNativeFee } from "./fees.mock"
import type { IPaymasterService } from "@argent/x-shared/paymaster"

const mockWallet = {
  isSessionOpen: vi.fn(),
  getSelectedAccount: vi.fn(),
  getStarknetAccount: vi.fn(),
  deployAccount: vi.fn(),
}

const mockPaymasterService = {
  getExecutionData: vi.fn(),
  execute: vi.fn(),
}

const mockTransactionsRepo = {
  get: vi.fn(),
  upsert: vi.fn(),
}

const mockEstimatedFeesRepo = {
  get: vi.fn(),
  put: vi.fn(),
}

const mockNonceService = {
  getNonce: vi.fn(),
  increaseLocalNonce: vi.fn(),
}

const mockInvestmentService = {
  notifySubmittedInvestment: vi.fn(),
}

const mockStarknetAccount = {
  execute: vi.fn(),
  signMessage: vi.fn(),
  getClassAt: vi.fn(),
}

describe("TransactionExecutionService", () => {
  let service: TransactionExecutionService

  beforeEach(() => {
    vi.resetAllMocks()
    service = new TransactionExecutionService(
      mockWallet as unknown as Wallet,
      mockPaymasterService as unknown as IPaymasterService,
      mockInvestmentService as unknown as IBackgroundInvestmentService,
      mockNonceService as unknown as INonceManagementService,
      mockTransactionsRepo as unknown as ITransactionsRepository,
      mockEstimatedFeesRepo as unknown as IEstimatedFeesRepository,
    )
  })

  describe("execute", () => {
    const mockAccount = getMockWalletAccount({
      id: "test",
      address: "0x123",
      networkId: "mainnet-alpha",
      type: "standard",
    })

    it("should throw if no open session", async () => {
      mockWallet.isSessionOpen.mockResolvedValue(false)
      await expect(service.execute({ transactions: [] })).rejects.toThrow(
        SessionError,
      )
    })

    it("should throw if no selected account", async () => {
      mockWallet.isSessionOpen.mockResolvedValue(true)
      mockWallet.getSelectedAccount.mockResolvedValue(null)
      await expect(service.execute({ transactions: [] })).rejects.toThrowError(
        AccountError,
      )
    })

    it("should execute with paymaster when precomputed fees are paymaster type", async () => {
      mockWallet.isSessionOpen.mockResolvedValue(true)
      mockWallet.getSelectedAccount.mockResolvedValue(mockAccount)
      mockTransactionsRepo.get.mockResolvedValue([])
      mockEstimatedFeesRepo.get.mockResolvedValue([
        { type: "paymaster", transactions: getMockPaymasterFee() },
      ])
      mockWallet.getStarknetAccount.mockResolvedValue(mockStarknetAccount)
      mockStarknetAccount.signMessage.mockResolvedValue(["1234", "23234"])
      mockPaymasterService.execute.mockResolvedValue("0x123243245235")
      const result = await service.execute({
        transactions: [],
        transactionsDetail: {},
        meta: {},
      })
      expect(result).toBe("0x123243245235")
      expect(mockPaymasterService.execute).toHaveBeenCalled()
    })

    it("should handle account deployment when needed", async () => {
      mockWallet.isSessionOpen.mockResolvedValue(true)
      mockWallet.getSelectedAccount.mockResolvedValue({
        ...mockAccount,
        needsDeploy: true,
      })
      mockTransactionsRepo.get.mockResolvedValue([])
      mockEstimatedFeesRepo.get.mockResolvedValue([
        {
          type: "native",
          transactions: getMockNativeFee(),
          deployment: getMockNativeFee(),
        },
      ])
      mockWallet.getStarknetAccount.mockResolvedValue(mockStarknetAccount)
      mockStarknetAccount.getClassAt.mockRejectedValue(
        new Error("Account not deployed"),
      )
      mockWallet.deployAccount.mockResolvedValue({
        account: mockAccount,
        txHash: "0x123243245235",
      })
      mockStarknetAccount.execute.mockResolvedValue({
        transaction_hash: "0x123243245235",
      })
      await service.execute({
        transactions: [],
        transactionsDetail: { nonce: 1 },
        meta: {},
      })

      expect(mockWallet.deployAccount).toHaveBeenCalled()
      expect(mockTransactionsRepo.upsert).toHaveBeenCalled()
    })
  })

  describe("executeWithPaymaster", () => {
    const mockAccount = {
      id: "test",
      address: "0x123",
      networkId: "mainnet-alpha",
    }

    it("should throw on invalid signature format", async () => {
      mockPaymasterService.getExecutionData.mockResolvedValue({})
      mockStarknetAccount.signMessage.mockResolvedValue("invalid-signature")

      await expect(
        service.executeWithPaymaster(
          mockAccount as any,
          mockStarknetAccount as unknown as BaseStarknetAccount,
          [],
          { type: "paymaster", transactions: getMockPaymasterFee() } as any,
        ),
      ).rejects.toThrow(TransactionError)
    })
  })
})
