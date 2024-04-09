import { describe, expect, test, vi } from "vitest"

import { IHttpService } from "@argent/x-shared"
import { KeyValueStorage } from "../../../../../shared/storage"
import { ITransactionReviewLabelsStore } from "../../../../../shared/transactionReview/interface"
import { TransactionReviewWorker } from "./implementation"
import { IBackgroundUIService } from "../../ui/interface"
import { emitterMock } from "../../../../wallet/test.utils"
import { delay } from "../../../../../shared/utils/delay"

describe("TransactionReviewWorker", () => {
  const makeService = () => {
    const transactionReviewLabelsStore = {
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

    const transactionReviewWorker = new TransactionReviewWorker(
      transactionReviewLabelsStore as unknown as KeyValueStorage<ITransactionReviewLabelsStore>,
      httpService as unknown as IHttpService,
      backgroundUIService as unknown as IBackgroundUIService,
    )

    return {
      transactionReviewWorker,
      transactionReviewLabelsStore,
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
    expect(httpService.get).toHaveBeenCalledOnce()
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
})
