import { ICacheService } from "../cache"
import { IDateService } from "./IDateService"
import { HttpError, IHttpService } from "./IHttpService"

type SWROptions = {
  freshFor: number
  staleFor: number
}

const log = (message: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message)
  }
}

function cloneResponse(
  response: Response,
  additionalHeaders: Record<string, string>,
): Response {
  const clonedResponse = response.clone()
  const headers = new Headers(clonedResponse.headers)
  for (const [key, value] of Object.entries(additionalHeaders)) {
    headers.set(key, value)
  }

  return new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: response.statusText,
    headers,
  })
}

export class SWRService implements Pick<IHttpService, "get"> {
  private inFlightRequests: Map<string, Promise<Response>> = new Map()

  constructor(
    private dateService: IDateService,
    private cacheService: ICacheService,
    private httpService: IHttpService,
    private options: SWROptions,
  ) {}

  async rawGet(url: string, requestInit?: RequestInit): Promise<Response> {
    try {
      const cachedResponse = await this.cacheService.get(url)

      const now = await this.dateService.now()
      const responseTimestamp = new Date(
        cachedResponse.headers.get("date") || "",
      )
      const elapsedTime = now.getTime() - responseTimestamp.getTime()

      if (elapsedTime < this.options.freshFor) {
        // Fresh cache, no need to revalidate
        log("🟢 [SWR] Using fresh cache")
        return cachedResponse
      } else if (elapsedTime < this.options.staleFor) {
        // Stale cache, revalidate in the background
        void this.fetchAndCache(url, requestInit)
        log("🟠 [SWR] Revalidating cache")
        return cachedResponse
      }

      throw new Error("Cache too old")
    } catch (e) {
      if (e instanceof HttpError) {
        // pass through HTTP errors
        throw e
      }

      // No cache or cache too old, fetch and wait
      log("🔴 [SWR] Fetching data")
      const response = await this.fetchAndCache(url, requestInit)
      return response
    }
  }

  async get<T>(url: string, requestInit?: RequestInit): Promise<T> {
    const response = await this.rawGet(url, requestInit)
    return this.parseResponse<T>(response)
  }

  private async fetchAndCache(
    url: string,
    requestInit?: RequestInit,
  ): Promise<Response> {
    const cachedRequest = this.inFlightRequests.get(url)
    if (!cachedRequest) {
      const request = this.httpService
        .get<Response>(url, requestInit)
        .then(async (response) => {
          const date = await this.dateService.now()
          await this.cacheService.set(
            url,
            cloneResponse(response, {
              date: date.toUTCString(),
            }),
          )
          return response
        })
        .finally(() => {
          this.inFlightRequests.delete(url)
        })

      this.inFlightRequests.set(url, request)
      return request
    }

    log("🔵 [SWR] Reusing in-flight request")
    return cachedRequest
  }

  private parseResponse<T>(response: Response): T {
    if (response.ok) {
      return response.json() as T
    }

    throw new HttpError(response.statusText, response.status)
  }
}
