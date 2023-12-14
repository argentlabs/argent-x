import { IHttpService } from "@argent/shared"

import urlJoin from "url-join"
import { RefreshInterval } from "../../../../../shared/config"
import { KeyValueStorage } from "../../../../../shared/storage"
import {
  ITransactionReviewLabel,
  ITransactionReviewLabelsStore,
} from "../../../../../shared/transactionReview/interface"
import { ITransactionReviewWorker } from "./interface"
import { IBackgroundUIService, Opened } from "../../ui/interface"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../../../shared/api/constants"

const REFRESH_PERIOD_MINUTES = RefreshInterval.VERY_SLOW
const labelsEndpoint = urlJoin(
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL || "",
  "labels",
)

export class TransactionReviewWorker implements ITransactionReviewWorker {
  constructor(
    private readonly labelsStore: KeyValueStorage<ITransactionReviewLabelsStore>,
    private httpService: IHttpService,
    private readonly backgroundUIService: IBackgroundUIService,
  ) {
    this.backgroundUIService.emitter.on(Opened, this.onOpened.bind(this))
    void this.maybeUpdateLabels()
  }

  async onOpened(opened: boolean) {
    if (opened) {
      await this.maybeUpdateLabels()
    }
  }

  /** only update if REFRESH_PERIOD_MINUTES have elapsed since last update */

  async maybeUpdateLabels() {
    const updatedAt = await this.labelsStore.get("updatedAt")
    const labels = await this.labelsStore.get("labels")
    if (updatedAt && labels) {
      const currentTimestamp = Date.now()
      const differenceInMilliseconds = currentTimestamp - updatedAt
      const differenceInMinutes = differenceInMilliseconds / (1000 * 60) // Convert milliseconds to minutes
      if (differenceInMinutes < REFRESH_PERIOD_MINUTES) {
        return
      }
    }
    await this.updateLabels()
  }

  async updateLabels() {
    try {
      const labels = await this.httpService.get<ITransactionReviewLabel[]>(
        labelsEndpoint,
      )
      const updatedAt = Date.now()
      await this.labelsStore.set("labels", labels)
      await this.labelsStore.set("updatedAt", updatedAt)
    } catch (error) {
      // ignore error - will retry next time
      console.warn("Error fetching trasnaction review labels", error)
    }
  }
}
