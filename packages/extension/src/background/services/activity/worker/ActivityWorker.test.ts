import "fake-indexeddb/auto"
import type { Mocked } from "vitest"
import { afterEach, describe, vi } from "vitest"

import { ActivityWorker } from "./ActivityWorker"
import type { IActivityCacheService } from "../../../../shared/activity/cache/IActivityCacheService"
import type { IActivityService } from "../IActivityService"
import type { INotificationService } from "../../../../shared/notifications/INotificationService"
import type { TransactionTrackerWorker } from "../../transactionTracker/worker/TransactionTrackerWorker"
import { TransactionStatusChanged } from "../../transactionTracker/worker/TransactionTrackerWorker"
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import { getMockWalletAccount } from "../../../../../test/walletAccount.mock"
import { getRandomAccountIdentifier } from "../../../../shared/utils/accountIdentifier"
import { emitterMock } from "../../../../shared/test.utils"
import { delay } from "../../../../shared/utils/delay"

vi.mock("../../../../shared/utils/delay")

describe("ActivityWorker", () => {
  let activityService: Mocked<IActivityService>
  let mockAccountService: Mocked<IAccountService>
  let notificationService: Mocked<INotificationService>
  let transactionTrackerWorker: TransactionTrackerWorker
  let activityCacheService: IActivityCacheService
  let activityWorker: ActivityWorker

  const mockActivity = {
    details: {
      srcAsset: {
        type: "token",
        network: "starknet",
        tokenAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        amount: "100000000000000",
        fiatAmount: { currency: "USD", currencyAmount: 0.24 },
      },
      destAsset: {
        type: "token",
        network: "starknet",
        tokenAddress:
          "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        amount: "92842484143801",
        fiatAmount: { currency: "USD", currencyAmount: 0.0 },
      },
      type: "trade",
    },
    fees: [
      {
        type: "gas",
        to: "0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8",
        actualFee: {
          type: "token",
          network: "starknet",
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          amount: "307272375042580",
          fiatAmount: { currency: "USD", currencyAmount: 0.74 },
        },
      },
    ],
    id: "1206478",
    lastModified: 1723047044215,
    network: "starknet",
    networkDetails: { ethereumNetwork: "sepolia", chainId: "SEPOLIA" },
    relatedAddresses: [
      {
        address:
          "0x02c56e8b00dbe2a71e57472685378fc8988bba947e9a99b26a00fade2b4fe7c2",
        network: "starknet",
        type: "wallet",
      },
      {
        address:
          "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        network: "starknet",
        type: "token",
      },
      {
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        network: "starknet",
        type: "token",
      },
      {
        address:
          "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
        id: "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f::sepolia-alpha::local_secret::0",
        network: "starknet",
        type: "wallet",
      },
    ],
    source: "transaction-monitor",
    title: "Swap",
    status: "success",
    submitted: 1723046984010,
    transaction: {
      network: "starknet",
      hash: "0x006e58fdc2a6b6aa6b4d92348aa189afe206921be09dd51e776dca1e762d23da",
      status: "pending",
      transactionIndex: 10,
    },
    transfers: [
      {
        type: "payment",
        leg: "credit",
        counterparty:
          "0x2c56e8b00dbe2a71e57472685378fc8988bba947e9a99b26a00fade2b4fe7c2",
        counterpartyNetwork: "starknet",
        asset: {
          type: "token",
          network: "starknet",
          tokenAddress:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          amount: "92842484143801",
          fiatAmount: { currency: "USD", currencyAmount: 0.0 },
        },
      },
      {
        type: "payment",
        leg: "debit",
        counterparty:
          "0x2c56e8b00dbe2a71e57472685378fc8988bba947e9a99b26a00fade2b4fe7c2",
        counterpartyNetwork: "starknet",
        asset: {
          type: "token",
          network: "starknet",
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          amount: "100000000000000",
          fiatAmount: { currency: "USD", currencyAmount: 0.24 },
        },
      },
      {
        type: "gasFee",
        leg: "debit",
        counterparty:
          "0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8",
        counterpartyNetwork: "starknet",
        asset: {
          type: "token",
          network: "starknet",
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          amount: "307272375042580",
          fiatAmount: { currency: "USD", currencyAmount: 0.74 },
        },
      },
    ],
    txSender:
      "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
    type: "trade",
    wallet:
      "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
  }

  const mockAddress =
    "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f"
  const mockNetworkId = "sepolia-alpha"

  const mockId = getRandomAccountIdentifier(mockAddress, mockNetworkId)

  const mockAccount = getMockWalletAccount({
    address: mockAddress,
    networkId: mockNetworkId,
    id: mockId,
  })

  beforeEach(() => {
    activityService = {
      updateAccountActivities: vi.fn(),
      updateSelectedAccountActivities: vi.fn(),
    } as unknown as Mocked<IActivityService>
    transactionTrackerWorker = {
      emitter: emitterMock,
    } as unknown as Mocked<TransactionTrackerWorker>
    activityCacheService = {} as unknown as Mocked<IActivityCacheService>
    notificationService = {
      showWithDeepLink: vi.fn(),
      makeId: vi.fn(),
      hasShown: vi.fn(),
    } as unknown as Mocked<INotificationService>
    mockAccountService = {
      get: vi.fn().mockResolvedValue([mockAccount]),
    } as unknown as Mocked<IAccountService>

    activityWorker = new ActivityWorker(
      activityService,
      mockAccountService,
      notificationService,
      activityCacheService,
      transactionTrackerWorker,
    )
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("should register event listeners on backend messaging and transaction tracker", () => {
    expect(transactionTrackerWorker.emitter.on).toHaveBeenCalledWith(
      TransactionStatusChanged,
      expect.any(Function),
    )
  })

  describe("onTransactionStatusChanged", () => {
    it("should not send notifications if there are empty activities", async () => {
      activityService.updateSelectedAccountActivities.mockReturnValueOnce(
        [] as any,
      )

      await activityWorker.onTransactionStatusChanged({
        transactions: ["0x123"],
      })

      expect(notificationService.showWithDeepLink).not.toHaveBeenCalled()
    })

    it("should not send notifications if there are no activities matching", async () => {
      activityService.updateSelectedAccountActivities.mockReturnValueOnce([
        mockActivity,
      ] as any)

      await activityWorker.onTransactionStatusChanged({
        transactions: ["0x123"],
      })

      expect(notificationService.showWithDeepLink).not.toHaveBeenCalled()
    })

    it("should send notifications if there are activities matching", async () => {
      activityService.updateSelectedAccountActivities.mockReturnValueOnce([
        mockActivity,
        { ...mockActivity, transaction: { hash: "0x1" } },
      ] as any)

      await activityWorker.onTransactionStatusChanged({
        transactions: [
          "0x006e58fdc2a6b6aa6b4d92348aa189afe206921be09dd51e776dca1e762d23da",
          "0x1",
        ],
      })

      expect(notificationService.showWithDeepLink).toHaveBeenNthCalledWith(
        1,
        {
          id: undefined,
          route:
            "/account/activity/0x006e58fdc2a6b6aa6b4d92348aa189afe206921be09dd51e776dca1e762d23da?returnTo=%2Faccount%2Factivity",
          account: {
            address:
              "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
            id: "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f::sepolia-alpha::local_secret::0",
            networkId: "sepolia-alpha",
          },
        },
        {
          title: "Swap",
          status: "success",
        },
      )
      expect(notificationService.showWithDeepLink).toHaveBeenNthCalledWith(
        2,
        {
          id: undefined,
          route: "/account/activity/0x1?returnTo=%2Faccount%2Factivity",
          account: {
            address:
              "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
            id: "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f::sepolia-alpha::local_secret::0",
            networkId: "sepolia-alpha",
          },
        },
        {
          title: "Swap",
          status: "success",
        },
      )
    })

    it("should poll if there are no activities yet", async () => {
      activityService.updateSelectedAccountActivities
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([
          mockActivity,
          { ...mockActivity, transaction: { hash: "0x1" } },
        ] as any)

      await activityWorker.onTransactionStatusChanged({
        transactions: [
          "0x006e58fdc2a6b6aa6b4d92348aa189afe206921be09dd51e776dca1e762d23da",
          "0x1",
        ],
      })

      expect(delay).toHaveBeenCalledTimes(2)
      expect(notificationService.showWithDeepLink).toHaveBeenNthCalledWith(
        1,
        {
          id: undefined,
          route:
            "/account/activity/0x006e58fdc2a6b6aa6b4d92348aa189afe206921be09dd51e776dca1e762d23da?returnTo=%2Faccount%2Factivity",
          account: {
            address:
              "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
            id: "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f::sepolia-alpha::local_secret::0",
            networkId: "sepolia-alpha",
          },
        },
        {
          title: "Swap",
          status: "success",
        },
      )
      expect(notificationService.showWithDeepLink).toHaveBeenNthCalledWith(
        2,
        {
          id: undefined,
          route: "/account/activity/0x1?returnTo=%2Faccount%2Factivity",
          account: {
            address:
              "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f",
            id: "0x01979190a7a4b6e7a497c6086f7183629a41828d9cc1f47e4f4bb6848461974f::sepolia-alpha::local_secret::0",
            networkId: "sepolia-alpha",
          },
        },
        {
          title: "Swap",
          status: "success",
        },
      )
    })

    it("should stop polling, if there are no activities after all delays", async () => {
      activityService.updateSelectedAccountActivities.mockReturnValueOnce(
        [] as any,
      )

      await activityWorker.onTransactionStatusChanged({
        transactions: [
          "0x006e58fdc2a6b6aa6b4d92348aa189afe206921be09dd51e776dca1e762d23da",
          "0x1",
        ],
      })

      expect(delay).toHaveBeenCalledTimes(5)
      expect(notificationService.showWithDeepLink).not.toHaveBeenCalled()
    })
  })
})
