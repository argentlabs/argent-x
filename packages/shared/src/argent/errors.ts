export abstract class CustomError<T extends string | number> extends Error {
  public constructor(public name: string, public code: T) {
    super(`${name}::${code}`) // used to compare errors, as errors lose their name and other properties when passed to client
    this.name = name // Required for instanceof checks
  }
}

export class BackendHttpError extends CustomError<number> {
  public constructor(code: number, public data?: unknown) {
    super("BackendHttpError", code)
  }
}

export class BackendPaginationError extends CustomError<
  "tooLow" | "notANumber"
> {
  public constructor(code: "tooLow" | "notANumber") {
    super("BackendPaginationError", code)
  }
}
