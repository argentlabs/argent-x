import { ZodType } from "zod"

export interface IHttpService {
  get<T>(url: string, options?: RequestInit): Promise<T>
  post<T>(
    url: string,
    options?: RequestInit,
    validationSchema?: ZodType,
  ): Promise<T>
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message)
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}
