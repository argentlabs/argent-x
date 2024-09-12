import { describe, expect, test, vi } from "vitest"

import type { IHttpService } from "@argent/x-shared"
import { KeyValueStorage } from "../../../../shared/storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewWarningsStore,
} from "../../../../shared/transactionReview/interface"
import { TransactionReviewWorker } from "./TransactionReviewWorker"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { emitterMock } from "../../../wallet/test.utils"
import { delay } from "../../../../shared/utils/delay"
import { getMockDebounceService } from "../../../../shared/debounce/mock"
import { createScheduleServiceMock } from "../../../../shared/schedule/mock"

describe("TransactionReviewWorker", () => {
  const makeService = () => {
    const transactionReviewLabelsStore = {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    }

    const transactionReviewWarningsStore = {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    }

    const httpService = {
      get: vi.fn(),
    }

    const backgroundUIService = {
      emitter: emitterMock,
    }

    const [, scheduleService] = createScheduleServiceMock()

    const debounceService = getMockDebounceService()

    const transactionReviewWorker = new TransactionReviewWorker(
      transactionReviewLabelsStore as unknown as KeyValueStorage<ITransactionReviewLabelsStore>,
      transactionReviewWarningsStore as unknown as KeyValueStorage<ITransactionReviewWarningsStore>,
      httpService as unknown as IHttpService,
      backgroundUIService as unknown as IBackgroundUIService,
      scheduleService,
      debounceService,
    )

    return {
      transactionReviewWorker,
      transactionReviewLabelsStore,
      transactionReviewWarningsStore,
      httpService,
    }
  }
  test("maybeUpdateLabels", async () => {
    const {
      transactionReviewWorker,
      transactionReviewLabelsStore,
      httpService,
    } = makeService()
    /** wait for init call */
    await delay(0)
    expect(httpService.get).toHaveBeenCalledTimes(2)
    httpService.get.mockReset()

    httpService.get.mockResolvedValueOnce([{ key: "foo", value: "bar" }])

    await transactionReviewWorker.maybeUpdateLabels()

    expect(transactionReviewLabelsStore.get).toHaveBeenCalledWith("updatedAt")
    expect(transactionReviewLabelsStore.get).toHaveBeenCalledWith("labels")
    expect(httpService.get).toHaveBeenCalledOnce()
    expect(transactionReviewLabelsStore.set).toHaveBeenCalledWith("labels", [
      { key: "foo", value: "bar" },
    ])

    httpService.get.mockReset()

    /** mock updated a minute ago */
    const aMomentAgo = Date.now() - 1000 * 60
    transactionReviewLabelsStore.get
      .mockResolvedValueOnce(aMomentAgo)
      .mockResolvedValueOnce([{ key: "foo", value: "bar" }])
    await transactionReviewWorker.maybeUpdateLabels()
    expect(httpService.get).not.toHaveBeenCalled()

    httpService.get.mockReset()
    httpService.get.mockResolvedValueOnce([{ key: "foo", value: "baz" }])

    /** mock updated days ago */
    const daysAgo = Date.now() - 1000 * 60 * 60 * 60 * 24
    transactionReviewLabelsStore.get
      .mockResolvedValueOnce(daysAgo)
      .mockResolvedValueOnce([{ key: "foo", value: "bar" }])
    await transactionReviewWorker.maybeUpdateLabels()
    expect(httpService.get).toHaveBeenCalledOnce()
    expect(transactionReviewLabelsStore.set).toHaveBeenCalledWith("labels", [
      { key: "foo", value: "baz" },
    ])
  })

  test("maybeUpdateWarnings", async () => {
    const {
      transactionReviewWorker,
      transactionReviewWarningsStore,
      httpService,
    } = makeService()
    /** wait for init call */
    await delay(0)
    expect(httpService.get).toHaveBeenCalledTimes(2)
    httpService.get.mockReset()

    const warning = {
      reason: "undeployed_account",
      title: "Sending to the correct account?",
      severity: "caution",
      description:
        "The account you are sending to hasn't done any transactions, please double check the address",
    }

    httpService.get.mockResolvedValueOnce([warning])

    await transactionReviewWorker.maybeUpdateWarnings()

    expect(transactionReviewWarningsStore.get).toHaveBeenCalledWith("updatedAt")
    expect(transactionReviewWarningsStore.get).toHaveBeenCalledWith("warnings")
    expect(httpService.get).toHaveBeenCalledOnce()
    expect(transactionReviewWarningsStore.set).toHaveBeenCalledWith(
      "warnings",
      [warning],
    )

    httpService.get.mockReset()

    /** mock updated a minute ago */
    const aMomentAgo = Date.now() - 1000 * 60
    transactionReviewWarningsStore.get
      .mockResolvedValueOnce(aMomentAgo)
      .mockResolvedValueOnce([warning])
    await transactionReviewWorker.maybeUpdateWarnings()
    expect(httpService.get).not.toHaveBeenCalled()

    httpService.get.mockReset()
    httpService.get.mockResolvedValueOnce([warning])

    /** mock updated days ago */
    const daysAgo = Date.now() - 1000 * 60 * 60 * 60 * 24
    transactionReviewWarningsStore.get
      .mockResolvedValueOnce(daysAgo)
      .mockResolvedValueOnce([warning])
    await transactionReviewWorker.maybeUpdateWarnings()
    expect(httpService.get).toHaveBeenCalledOnce()
    expect(transactionReviewWarningsStore.set).toHaveBeenCalledWith(
      "warnings",
      [warning],
    )
  })
})
