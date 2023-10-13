import { IHttpService, HTTPService } from "../http"
import { KnownDappsBackendService } from "./interface"
import { KnownDapp, knownDappsSchema } from "./model"

export class ArgentKnownDappsBackendService
  implements KnownDappsBackendService
{
  private readonly httpService: IHttpService

  constructor(protected readonly apiBase: string, init?: RequestInit) {
    this.httpService = new HTTPService(init, "json")
  }

  async getAll(): Promise<KnownDapp[]> {
    const response = await this.httpService.get<KnownDapp[]>(
      `${this.apiBase}/tokens/dapps`,
    )

    const parsed = knownDappsSchema.safeParse(response)

    if (!parsed.success) {
      throw new Error("Failed to parse known dapps")
    }

    return parsed.data
  }
}
