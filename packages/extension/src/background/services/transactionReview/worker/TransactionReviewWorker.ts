import type {
  IHttpService,
  ITransactionReviewLabel,
  ITransactionReviewWarning,
} from "@argent/x-shared"
import urlJoin from "url-join"

import { RefreshIntervalInSeconds } from "../../../../shared/config"
import type { KeyValueStorage } from "../../../../shared/storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewWarningsStore,
} from "../../../../shared/transactionReview/interface"
import type { ITransactionReviewWorker } from "./ITransactionReviewWorker"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../../shared/api/constants"
import { pipe } from "../../worker/schedule/pipe"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { IDebounceService } from "../../../../shared/debounce"

const REFRESH_PERIOD_SECONDS = RefreshIntervalInSeconds.SLOW
const labelsEndpoint = urlJoin(
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL || "",
  "labels",
)
const warningsEndpoint = urlJoin(
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL || "",
  "warnings/reasons",
)

export class TransactionReviewWorker implements ITransactionReviewWorker {
  constructor(
    private readonly labelsStore: KeyValueStorage<ITransactionReviewLabelsStore>,
    private readonly warningsStore: KeyValueStorage<ITransactionReviewWarningsStore>,
    private httpService: IHttpService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly scheduleService: IScheduleService,
    private readonly debounceService: IDebounceService,
  ) {
    void this.runUpdates()
  }

  runOnOpen = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshIntervalInSeconds.MEDIUM,
      "TransactionReviewWorker.runUpdates",
    ),
  )(async () => {
    await this.runUpdates()
  })

  async runUpdates() {
    await this.maybeUpdateLabels()
    await this.maybeUpdateWarnings()
  }

  /** only update if REFRESH_PERIOD_MINUTES have elapsed since last update */

  async maybeUpdateLabels() {
    const updatedAt = await this.labelsStore.get("updatedAt")
    const labels = await this.labelsStore.get("labels")
    if (updatedAt && labels) {
      const currentTimestamp = Date.now()
      const differenceInMilliseconds = currentTimestamp - updatedAt
      const differenceInMinutes = differenceInMilliseconds / 1000 // Convert milliseconds to seconds
      if (differenceInMinutes < REFRESH_PERIOD_SECONDS) {
        return
      }
    }
    await this.updateLabels()
  }

  async updateLabels() {
    try {
      const labels =
        await this.httpService.get<ITransactionReviewLabel[]>(labelsEndpoint)
      const updatedAt = Date.now()
      await this.labelsStore.set("labels", labels)
      await this.labelsStore.set("updatedAt", updatedAt)
    } catch (error) {
      // ignore error - will retry next time
      console.warn("Error fetching transaction review labels", error)
    }
  }

  /** only update if REFRESH_PERIOD_MINUTES have elapsed since last update */

  async maybeUpdateWarnings() {
    const updatedAt = await this.warningsStore.get("updatedAt")
    const warnings = await this.warningsStore.get("warnings")
    if (updatedAt && warnings) {
      const currentTimestamp = Date.now()
      const differenceInMilliseconds = currentTimestamp - updatedAt
      const differenceInMinutes = differenceInMilliseconds / 1000 // Convert milliseconds to seconds
      if (differenceInMinutes < REFRESH_PERIOD_SECONDS) {
        return
      }
    }
    await this.updateWarnings()
  }

  async updateWarnings() {
    try {
      const warnings =
        await this.httpService.get<ITransactionReviewWarning[]>(
          warningsEndpoint,
        )
      const updatedAt = Date.now()
      await this.warningsStore.set("warnings", warnings)
      await this.warningsStore.set("updatedAt", updatedAt)
    } catch (error) {
      // ignore error - will retry next time
      console.warn("Error fetching transaction review warnings", error)
    }
  }
}
