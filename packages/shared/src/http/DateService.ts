// TODO: refactor using /time endpoint

import { IDateService } from "./IDateService"
import { IHttpService } from "./IHttpService"

export class DateService implements IDateService {
  private offsetInS = 0
  private readonly syncIntervalInMs = 60 * 1000
  private readonly initialSync: Promise<void>

  constructor(
    private readonly httpService: IHttpService,
    private readonly baseUrl: string,
  ) {
    this.initialSync = this.syncWithServer()
    setInterval(() => this.syncWithServer(), this.syncIntervalInMs)
  }

  async now(): Promise<Date> {
    await this.initialSync

    return new Date(Date.now() + this.offsetInS * 1000)
  }

  private async syncWithServer(): Promise<void> {
    if (typeof window === "undefined") {
      return
    }

    const { time: serverTime } = await this.httpService.get<{ time: number }>(
      `${this.baseUrl}/time`,
    )
    const machineTimeInS = Math.floor(Date.now() / 1000)
    const offset = serverTime - machineTimeInS
    if (offset !== 0) {
      console.log("🕒 Time offset: ", `${offset}s`)
    }
    this.offsetInS = offset
  }
}
