import { ZodType } from "zod"

export interface IHttpService {
  get<T>(url: string, options?: RequestInit): Promise<T>
  post<T>(
    url: string,
    options?: RequestInit,
    validationSchema?: ZodType,
  ): Promise<T>
  delete(url: string, options?: RequestInit): Promise<void>
}

export enum HTTP_ERROR_MESSAGE {
  FAILED_TO_FETCH_URL = "Failed to fetch url",
  FAILED_TO_POST_URL = "Failed to post url",
}

export class HttpError extends Error {
  constructor(
    message: HTTP_ERROR_MESSAGE | string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message)
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}
