import { describe, expect, test, vi } from "vitest"

import { BackgroundRecoveryService } from "./implementation"
import { IObjectStore } from "../../../../shared/storage/__new/interface"
import { IRecoveryStorage } from "../../../../shared/recovery/types"
import type { Wallet } from "../../../wallet"
import type { TransactionTrackerWorker } from "../../../transactions/service/starknet.service"

describe("BackgroundRecoveryService", () => {
  const makeService = () => {
    const recoveryStore = {
      set: vi.fn(),
    } as unknown as IObjectStore<IRecoveryStorage>
    const wallet = {
      importBackup: vi.fn(),
      restoreSeedPhrase: vi.fn(),
    } as unknown as Wallet
    const transactionTracker = {
      loadHistory: vi.fn(),
    } as unknown as TransactionTrackerWorker
    const backgroundRecoveryService = new BackgroundRecoveryService(
      recoveryStore,
      wallet,
      transactionTracker,
    )
    return {
      recoveryStore,
      wallet,
      transactionTracker,
      backgroundRecoveryService,
    }
  }
  describe("importBackup", () => {
    test("it should call services and update isRecovering state", async () => {
      const { recoveryStore, wallet, backgroundRecoveryService } = makeService()
      await backgroundRecoveryService.byBackup("foo")
      expect(recoveryStore.set).toHaveBeenNthCalledWith(1, {
        errorRecovering: false,
      })
      expect(recoveryStore.set).toHaveBeenNthCalledWith(2, {
        isRecovering: true,
      })
      expect(recoveryStore.set).toHaveBeenNthCalledWith(3, {
        isRecovering: false,
      })
      expect(wallet.importBackup).toHaveBeenCalledWith("foo")
    })
  })
  describe("bySeedPhrase", () => {
    test("it should call services and update isRecovering state", async () => {
      const {
        recoveryStore,
        wallet,
        transactionTracker,
        backgroundRecoveryService,
      } = makeService()
      await backgroundRecoveryService.bySeedPhrase("foo", "bar")
      expect(recoveryStore.set).toHaveBeenNthCalledWith(1, {
        errorRecovering: false,
      })
      expect(recoveryStore.set).toHaveBeenNthCalledWith(2, {
        isRecovering: true,
      })
      expect(recoveryStore.set).toHaveBeenNthCalledWith(3, {
        isRecovering: false,
      })
      expect(wallet.restoreSeedPhrase).toHaveBeenCalledWith("foo", "bar")
      expect(transactionTracker.loadHistory).toHaveBeenCalled()
    })
  })
})
