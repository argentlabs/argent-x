import { isFunction } from "lodash-es"
import { ZodType } from "zod"

import { HttpError, IHttpService } from "./IHttpService"

type ResponseType = "response" | "json"

type AllowPromise<T> = T | Promise<T>
type CanBeFn<T = unknown> = T | (() => AllowPromise<T>)

export class HTTPService implements IHttpService {
  private requestInit: CanBeFn<RequestInit> | undefined
  private responseType: ResponseType

  constructor(
    requestInit?: CanBeFn<RequestInit>,
    responseType: ResponseType = "json",
  ) {
    this.requestInit = requestInit
    this.responseType = responseType
  }

  async get<T>(url: string, requestInit?: RequestInit): Promise<T> {
    const globalRequestInit = isFunction(this.requestInit)
      ? await this.requestInit()
      : this.requestInit

    const mergedRequestInit = {
      ...globalRequestInit,
      ...requestInit,
      method: "GET",
      // merge headers
      headers: {
        ...globalRequestInit?.headers,
        ...requestInit?.headers,
      },
    }

    const response = await fetch(url, mergedRequestInit).catch(() => {
      throw new HttpError("Failed to fetch url", 0)
    })

    if (this.responseType === "json") {
      if (!response.ok) {
        throw new HttpError(response.statusText, response.status)
      }
      return (await response.json()) as T
    }

    return response as unknown as T
  }

  async post<T>(
    url: string,
    requestInit?: RequestInit,
    validationSchema?: ZodType,
  ): Promise<T> {
    const globalRequestInit = isFunction(this.requestInit)
      ? await this.requestInit()
      : this.requestInit

    const mergedRequestInit = {
      ...globalRequestInit,
      ...requestInit,
      method: "POST",
      // merge headers
      headers: {
        ...globalRequestInit?.headers,
        ...requestInit?.headers,
      },
    }

    const response = await fetch(url, mergedRequestInit).catch(() => {
      throw new HttpError("Failed to post url", 0)
    })

    if (!response.ok) {
      throw new HttpError(response.statusText, response.status)
    }

    const json = await response.json()
    if (validationSchema) {
      try {
        const validatedData: T = validationSchema.parse(json)
        return validatedData
      } catch (e) {
        throw new HttpError((e as any).message, 0)
      }
    }
    return json as T
  }
}
