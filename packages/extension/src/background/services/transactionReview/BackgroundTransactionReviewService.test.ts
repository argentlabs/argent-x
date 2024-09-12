import { Address, IHttpService } from "@argent/x-shared"
import { Account, EstimateFee } from "starknet"
import { Mocked, describe, expect, test, vi } from "vitest"

import type { KeyValueStorage } from "../../../shared/storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewWarningsStore,
  TransactionReviewTransactions,
} from "../../../shared/transactionReview/interface"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { Wallet } from "../../wallet"
import BackgroundTransactionReviewService from "./BackgroundTransactionReviewService"
import type { ITransactionReviewWorker } from "./worker/ITransactionReviewWorker"

import sendFixture from "../../../shared/transactionReview/__fixtures__/send.json"
import simulationErrorUnexpectedFixture from "../../../shared/transactionReview/__fixtures__/simulation-error-unexpected.json"

describe("BackgroundTransactionReviewService", () => {
  const makeService = () => {
    const walletSingleton = {
      getSelectedAccount: vi.fn(),
      getSelectedStarknetAccount: vi.fn(),
    } as unknown as Mocked<Wallet>

    const httpService = {
      get: vi.fn(),
      post: vi.fn(),
    } as unknown as Mocked<IHttpService>

    const transactionReviewLabelsStore = {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as Mocked<KeyValueStorage<ITransactionReviewLabelsStore>>

    const transactionReviewWarningsStore = {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as Mocked<KeyValueStorage<ITransactionReviewWarningsStore>>

    const transactionReviewWorker = {
      maybeUpdateLabels: vi.fn(),
    } as unknown as Mocked<ITransactionReviewWorker>

    const backgroundTransactionReviewService =
      new BackgroundTransactionReviewService(
        walletSingleton,
        httpService,
        transactionReviewLabelsStore,
        transactionReviewWarningsStore,
        transactionReviewWorker,
      )

    const networkId = "sepolia-alpha"

    walletSingleton.getSelectedAccount.mockResolvedValue({
      address: "0x123",
      networkId,
      network: {
        id: networkId,
      },
    } as WalletAccount)

    const starknetAccount = {
      cairoVersion: "1",
      getNonce: vi.fn(),
      getChainId: vi.fn(),
      estimateFee: vi.fn(),
    } as unknown as Mocked<Account>

    starknetAccount.estimateFee.mockResolvedValue({
      gas_consumed: 123n,
      gas_price: 456n,
    } as EstimateFee)

    walletSingleton.getSelectedStarknetAccount.mockResolvedValue(
      starknetAccount,
    )

    const feeTokenAddress: Address = "0x123456"

    return {
      backgroundTransactionReviewService,
      walletSingleton,
      httpService,
      transactionReviewLabelsStore,
      transactionReviewWorker,
      feeTokenAddress,
      starknetAccount,
    }
  }
  describe("simulateAndReview", () => {
    describe("when backend returns success", () => {
      describe("and there are no errors", () => {
        test("returns simulation and review", async () => {
          const {
            backgroundTransactionReviewService,
            httpService,
            feeTokenAddress,
          } = makeService()

          const transactions: TransactionReviewTransactions[] = [
            {
              type: "INVOKE",
              calls: [],
            },
          ]

          httpService.post.mockResolvedValueOnce(sendFixture)

          const result =
            await backgroundTransactionReviewService.simulateAndReview({
              transactions,
              feeTokenAddress,
            })

          expect(result).toMatchObject(sendFixture)

          expect(result.enrichedFeeEstimation).toMatchInlineSnapshot(`
            {
              "deployment": undefined,
              "transactions": {
                "amount": 2788n,
                "dataGasConsumed": 0n,
                "dataGasPrice": 0n,
                "feeTokenAddress": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                "max": {
                  "maxFee": 447452402228894n,
                },
                "pricePerUnit": 80246126522n,
              },
            }
          `)
        })
      })
      describe("and there are errors", () => {
        test("do not fallback to on-chain simulation", async () => {
          const {
            backgroundTransactionReviewService,
            httpService,
            feeTokenAddress,
            starknetAccount,
          } = makeService()

          const transactions: TransactionReviewTransactions[] = [
            {
              type: "INVOKE",
              calls: [],
            },
          ]

          httpService.post.mockResolvedValueOnce(
            simulationErrorUnexpectedFixture,
          )

          const fallbackToOnchainFeeEstimationSpy = vi.spyOn(
            backgroundTransactionReviewService,
            "fallbackToOnchainFeeEstimation",
          )

          const result =
            await backgroundTransactionReviewService.simulateAndReview({
              transactions,
              feeTokenAddress,
            })

          expect(fallbackToOnchainFeeEstimationSpy).not.toHaveBeenCalledOnce()

          expect(starknetAccount.estimateFee).not.toHaveBeenCalledOnce()
        })
      })
      describe("when backend fails with error", () => {
        test("falls back to on-chain simulation", async () => {
          const {
            backgroundTransactionReviewService,
            httpService,
            feeTokenAddress,
            starknetAccount,
          } = makeService()

          const transactions: TransactionReviewTransactions[] = [
            {
              type: "INVOKE",
              calls: [],
            },
          ]

          httpService.post.mockRejectedValueOnce(new Error())

          const fallbackToOnchainFeeEstimationSpy = vi.spyOn(
            backgroundTransactionReviewService,
            "fallbackToOnchainFeeEstimation",
          )

          const result =
            await backgroundTransactionReviewService.simulateAndReview({
              transactions,
              feeTokenAddress,
            })

          expect(fallbackToOnchainFeeEstimationSpy).toHaveBeenCalledOnce()

          expect(starknetAccount.estimateFee).toHaveBeenCalledOnce()

          expect(result).toMatchObject({
            isBackendDown: true,
            enrichedFeeEstimation: {
              transactions: {
                amount: 123n,
                feeTokenAddress,
                pricePerUnit: 456n,
              },
            },
          })
        })
      })
    })
  })
})
