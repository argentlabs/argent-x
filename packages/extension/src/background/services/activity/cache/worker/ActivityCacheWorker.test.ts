import {
  AnyActivity,
  NativeActivityTypeNative,
} from "@argent/x-shared/simulation"
import Emittery from "emittery"
import { describe, expect, test, vi, type Mocked } from "vitest"
import { ActivityCacheWorker } from "./ActivityCacheWorker"

import type { IActionQueue } from "../../../../../shared/actionQueue/queue/IActionQueue"
import type { ActionItem } from "../../../../../shared/actionQueue/types"
import type { IActivityCacheService } from "../../../../../shared/activity/cache/IActivityCacheService"
import { InMemoryRepository } from "../../../../../shared/storage/__new/__test__/inmemoryImplementations"
import {
  compareTransactions,
  type Transaction,
} from "../../../../../shared/transactions"
import { delay } from "../../../../../shared/utils/delay"
import type { BaseWalletAccount } from "../../../../../shared/wallet.model"
import {
  TransactionCreatedForAction,
  type Events as BackgroundActionServiceEvents,
  type IBackgroundActionService,
} from "../../../action/IBackgroundActionService"
import type {
  Events as ActivityServiceEvents,
  IActivityService,
} from "../../IActivityService"
import { MultisigEmitterEvents } from "../../../../../shared/multisig/emitter"
import { MultisigPendingTransaction } from "../../../../../shared/multisig/pendingTransactionsStore"
import { ArrayStorage } from "../../../../../shared/storage"
import type { IAddressService } from "../../../../../shared/address/IAddressService"

const networkId = "sepolia-alpha"

const account: BaseWalletAccount = {
  address: "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
  networkId,
}

const transaction1 = {
  hash: "0x2",
  status: {
    finality_status: "RECEIVED",
  },
  timestamp: 0,
  account: {
    type: "standard",
    ...account,
  },
} as Transaction

describe("ActivityCacheWorker", () => {
  const makeService = () => {
    const activityServiceEmitter = new Emittery<ActivityServiceEvents>()

    const activityService = {
      emitter: activityServiceEmitter,
    } as unknown as IActivityService

    const activityCacheService: Mocked<IActivityCacheService> = {
      getActivityCacheItem: vi.fn(),
      setActivityCacheItem: vi.fn(),
      getCachedActivities: vi.fn(),
      setCachedActivities: vi.fn(),
      loadMore: vi.fn(),
      upsertActivities: vi.fn(),
    }

    const transactionsRepo = new InMemoryRepository<Transaction>({
      namespace: "core:transactions",
      compare: compareTransactions,
      defaults: [transaction1],
    })

    const actionQueue = {
      get: vi.fn(),
    } as unknown as IActionQueue<ActionItem>

    const actionServiceEmitter = new Emittery<BackgroundActionServiceEvents>()
    const actionService = {
      emitter: actionServiceEmitter,
    } as unknown as IBackgroundActionService

    const multisigEmitter = new Emittery<MultisigEmitterEvents>()
    const multisigPendingTransactionsStore =
      new ArrayStorage<MultisigPendingTransaction>([], {
        namespace: "core:multisig:pendingTransactions",
        compare: (a, b) => a.requestId === b.requestId,
      })

    const addressService = {} as unknown as IAddressService

    const activityCacheWorker = new ActivityCacheWorker(
      activityService,
      activityCacheService,
      transactionsRepo,
      actionQueue,
      actionService,
      multisigEmitter,
      multisigPendingTransactionsStore,
      addressService,
    )
    return {
      activityService,
      activityServiceEmitter,
      activityCacheService,
      transactionsRepo,
      actionQueue,
      actionService,
      actionServiceEmitter,
      multisigEmitter,
      multisigPendingTransactionsStore,
      activityCacheWorker,
      addressService,
    }
  }

  describe("When a Transaction is created for an Action", () => {
    test("Creates a new NativeActivity", async () => {
      const {
        activityService,
        activityServiceEmitter,
        activityCacheService,
        transactionsRepo,
        actionQueue,
        actionService,
        actionServiceEmitter,
        activityCacheWorker,
      } = makeService()

      const transactionCreatedForActionSpy = vi.spyOn(
        activityCacheWorker,
        "transactionCreatedForAction",
      )

      await actionServiceEmitter.emit(TransactionCreatedForAction, {
        actionHash: "0x1",
        transactionHash: transaction1.hash,
      })

      expect(transactionCreatedForActionSpy).toHaveBeenCalledOnce()
      expect(transactionCreatedForActionSpy).toHaveBeenNthCalledWith(1, {
        actionHash: "0x1",
        transactionHash: transaction1.hash,
      })

      expect(activityCacheService.upsertActivities).toHaveBeenCalledOnce()
      expect(activityCacheService.upsertActivities).toHaveBeenNthCalledWith(1, {
        account,
        activities: [
          expect.objectContaining({
            status: "pending",
            type: NativeActivityTypeNative,
            transaction: {
              hash: transaction1.hash,
            },
          }),
        ],
      })
    })
  })

  describe("When a Transaction is updated", () => {
    test("Updates existing NativeActivity", async () => {
      const {
        activityService,
        activityServiceEmitter,
        activityCacheService,
        transactionsRepo,
        actionQueue,
        actionService,
        actionServiceEmitter,
        activityCacheWorker,
      } = makeService()

      const onTransactionRepoChangeSpy = vi.spyOn(
        activityCacheWorker,
        "onTransactionRepoChange",
      )

      activityCacheService.getCachedActivities.mockResolvedValueOnce([
        {
          type: NativeActivityTypeNative,
          transaction: {
            hash: transaction1.hash,
          },
        },
      ] as AnyActivity[])

      await transactionsRepo.upsert({
        ...transaction1,
        status: {
          finality_status: "RECEIVED",
          execution_status: "SUCCEEDED",
        },
      })

      expect(onTransactionRepoChangeSpy).toHaveBeenCalledOnce()

      /** wait for next event loop for event handler to run */
      await delay(0)

      expect(activityCacheService.upsertActivities).toHaveBeenCalledOnce()
      expect(activityCacheService.upsertActivities).toHaveBeenNthCalledWith(1, {
        account,
        activities: [
          expect.objectContaining({
            status: "success",
            type: NativeActivityTypeNative,
            transaction: {
              hash: transaction1.hash,
            },
          }),
        ],
      })
    })
  })
})
