import type { Address, IHttpService, TransactionAction } from "@argent/x-shared"
import type { Account, EstimateFee } from "starknet"
import { TransactionType } from "starknet"
import type { Mocked } from "vitest"
import { describe, expect, test, vi } from "vitest"

import type { KeyValueStorage } from "../../../shared/storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewWarningsStore,
} from "../../../shared/transactionReview/interface"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { Wallet } from "../../wallet"
import BackgroundTransactionReviewService from "./BackgroundTransactionReviewService"
import type { ITransactionReviewWorker } from "./worker/ITransactionReviewWorker"

import sendFixture from "../../../shared/transactionReview/__fixtures__/send.json"
import simulationErrorUnexpectedFixture from "../../../shared/transactionReview/__fixtures__/simulation-error-unexpected.json"
import { getRandomAccountIdentifier } from "../../../shared/utils/accountIdentifier"
import type { BaseStarknetAccount } from "../../../shared/starknetAccount/base"
import type { INonceManagementService } from "../../nonceManagement/INonceManagementService"

describe("BackgroundTransactionReviewService", () => {
  const makeService = () => {
    const walletSingleton = {
      getSelectedAccount: vi.fn(),
      getSelectedStarknetAccount: vi.fn(),
      getStarknetAccount: vi.fn(),
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

    const nonceManagementService = {
      getNonce: vi.fn(),
    } as unknown as Mocked<INonceManagementService>

    const transactionReviewWorker = {
      maybeUpdateLabels: vi.fn(),
    } as unknown as Mocked<ITransactionReviewWorker>

    const backgroundTransactionReviewService =
      new BackgroundTransactionReviewService(
        walletSingleton,
        httpService,
        nonceManagementService,
        transactionReviewLabelsStore,
        transactionReviewWarningsStore,
        transactionReviewWorker,
      )

    const networkId = "sepolia-alpha"

    walletSingleton.getSelectedAccount.mockResolvedValue({
      id: getRandomAccountIdentifier("0x123"),
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
      estimateInvokeFee: vi.fn(),
    } as unknown as Mocked<Account>

    const estimateFee = {
      gas_consumed: 123n,
      gas_price: 456n,
    } as EstimateFee

    starknetAccount.estimateInvokeFee.mockResolvedValue(estimateFee)

    walletSingleton.getSelectedStarknetAccount.mockResolvedValue(
      starknetAccount,
    )

    const baseStarknetAccount = {
      ...starknetAccount,
      estimateFeeBulk: vi.fn(),
    } as unknown as Mocked<BaseStarknetAccount>

    baseStarknetAccount.estimateInvokeFee.mockResolvedValue(estimateFee)

    walletSingleton.getStarknetAccount.mockResolvedValue(baseStarknetAccount)

    const feeTokenAddress: Address = "0x123456"

    return {
      backgroundTransactionReviewService,
      walletSingleton,
      httpService,
      nonceManagementService,
      transactionReviewLabelsStore,
      transactionReviewWorker,
      feeTokenAddress,
      starknetAccount,
      baseStarknetAccount,
    }
  }
  describe("simulateAndReview", () => {
    describe("when backend returns success", () => {
      describe("and there are no errors", () => {
        test("returns simulation and review", async () => {
          const {
            backgroundTransactionReviewService,
            httpService,
            nonceManagementService,
          } = makeService()

          const transaction: TransactionAction = {
            type: TransactionType.INVOKE,
            payload: [],
          }

          httpService.post.mockResolvedValueOnce(sendFixture)
          nonceManagementService.getNonce.mockResolvedValueOnce("0x2")
          const result =
            await backgroundTransactionReviewService.simulateAndReview({
              transaction,
            })
          expect(result).toMatchObject(sendFixture)

          expect(result.enrichedFeeEstimation).toMatchInlineSnapshot(`
            [
              {
                "deployment": undefined,
                "transactions": {
                  "amount": 21n,
                  "dataGasConsumed": 0n,
                  "dataGasPrice": 0n,
                  "feeTokenAddress": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                  "max": {
                    "amount": 42n,
                    "pricePerUnit": 3458002953105856n,
                  },
                  "pricePerUnit": 2305335302099180n,
                },
                "type": "native",
              },
              {
                "deployment": undefined,
                "transactions": {
                  "feeTokenAddress": "0x0030058f19ed447208015f6430f0102e8ab82d6c291566d7e73fe8e613c3d2ed",
                  "maxFee": 2328n,
                  "overallFee": 776n,
                },
                "type": "paymaster",
              },
              {
                "deployment": undefined,
                "transactions": {
                  "feeTokenAddress": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                  "maxFee": 12970632528043n,
                  "overallFee": 4323550018745n,
                },
                "type": "paymaster",
              },
              {
                "deployment": undefined,
                "transactions": {
                  "feeTokenAddress": "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080",
                  "maxFee": 43695n,
                  "overallFee": 14565n,
                },
                "type": "paymaster",
              },
            ]
          `)
        })
      })
      describe("and there are errors", () => {
        test("do not fallback to on-chain simulation", async () => {
          const {
            backgroundTransactionReviewService,
            httpService,
            starknetAccount,
            nonceManagementService,
          } = makeService()

          const transaction = {
            type: TransactionType.INVOKE,
            payload: [],
          }

          httpService.post.mockResolvedValueOnce(
            simulationErrorUnexpectedFixture,
          )

          const getEnrichedFeeEstimationSpy = vi.spyOn(
            backgroundTransactionReviewService,
            "getEnrichedFeeEstimation",
          )

          nonceManagementService.getNonce.mockResolvedValueOnce("0x2")
          await backgroundTransactionReviewService.simulateAndReview({
            transaction,
          })

          expect(getEnrichedFeeEstimationSpy).not.toHaveBeenCalledOnce()

          expect(starknetAccount.estimateInvokeFee).not.toHaveBeenCalledOnce()
        })
      })
      describe("when backend fails with error", () => {
        test("falls back to on-chain simulation", async () => {
          const {
            backgroundTransactionReviewService,
            httpService,
            baseStarknetAccount,
            nonceManagementService,
          } = makeService()

          const transaction = {
            type: TransactionType.INVOKE,
            payload: [],
          }

          nonceManagementService.getNonce.mockResolvedValueOnce("0x2")

          httpService.post.mockRejectedValueOnce(new Error())

          const fallbackToOnchainFeeEstimationSpy = vi.spyOn(
            backgroundTransactionReviewService,
            "fallbackToOnchainFeeEstimation",
          )

          const result =
            await backgroundTransactionReviewService.simulateAndReview({
              transaction,
            })

          expect(fallbackToOnchainFeeEstimationSpy).toHaveBeenCalledOnce()

          expect(baseStarknetAccount.estimateInvokeFee).toHaveBeenCalledOnce()

          expect(result).toMatchObject({
            isBackendDown: true,
            enrichedFeeEstimation: [
              {
                type: "native",
                transactions: {
                  amount: 123n,
                  pricePerUnit: 456n,
                },
              },
            ],
          })
        })
      })
    })
  })
})
