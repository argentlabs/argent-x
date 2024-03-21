import { type IHttpService } from "@argent/x-shared"

import { RefreshInterval } from "../../../../shared/config"
import type { IDebounceService } from "../../../../shared/debounce"
import type {
  IDiscoverStorage,
  IDiscoverService,
} from "../../../../shared/discover/interface"
import { newsApiReponseSchema } from "../../../../shared/discover/schema"
import type { IScheduleService } from "../../../../shared/schedule/interface"
import type { IObjectStore } from "../../../../shared/storage/__new/interface"
import type { IBackgroundUIService } from "../ui/interface"
import { everyWhenOpen } from "../worker/schedule/decorators"
import { pipe } from "../worker/schedule/pipe"
import { ARGENT_X_NEWS_URL } from "../../../../shared/api/constants"

export class DiscoverService implements IDiscoverService {
  constructor(
    private readonly discoverStore: IObjectStore<IDiscoverStorage>,
    private readonly httpService: IHttpService,
    private readonly scheduleService: IScheduleService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly debounceService: IDebounceService,
  ) {}

  runUpdateSelectedAccountActivities = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshInterval.MEDIUM,
      "DiscoverService.updateDiscover",
    ),
  )(async () => {
    await this.updateDiscover()
  })

  async updateDiscover() {
    if (!ARGENT_X_NEWS_URL) {
      return this.resetData()
    }

    const result = await this.httpService.get(ARGENT_X_NEWS_URL)
    const parsedResult = newsApiReponseSchema.safeParse(result)
    if (!parsedResult.success) {
      // on failure, ensure we don't show stale data to end user
      return this.resetData()
    }

    const { news, lastModified } = parsedResult.data

    const sortedNews = news.sort((a, b) => {
      if (!a.created || !b.created) {
        return 0
      }
      const dateA = new Date(a.created)
      const dateB = new Date(b.created)

      return dateB.getTime() - dateA.getTime()
    })

    await this.discoverStore.set({
      data: {
        lastModified,
        news: sortedNews,
      },
    })
  }

  private async resetData() {
    await this.discoverStore.set({
      data: null,
    })
  }

  async setViewedAt(viewedAt: number) {
    await this.discoverStore.set({
      viewedAt,
    })
  }
}
