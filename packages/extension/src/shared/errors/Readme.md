# tRPC error handling

Custom error handling based on:

- https://trpc.io/docs/server/error-handling
- https://trpc.io/docs/server/error-formatting

## Usage

### Create a domain error

```tsx
import { BaseError } from "./baseError"

export const ERROR_CODE_1 = "ERROR_CODE_1"
export const ERROR_CODE_2 = "ERROR_CODE_2"

export type ErrorCodes = typeof ERROR_CODE_1 | typeof ERROR_CODE_2

export class CustomDomainError extends BaseError<ErrorCodes> {}
```

### Throw custom domain error

```tsx
throw new CustomDomainError({
  code: ERROR_CODE_1,
  message: "optional",
  context: {
    // optional, might hold potentially useful information like address, email, etc. To be used for example while debugging in sentry
    address: ""
  }
})
```

### Handle custom domain error

```tsx
export const getErrorMessage = (error: unknown) => {
  if (!isErrorOfType<ErrorCodes>(error, CustomDomainError.name)) {
    return null
  }

  return ERROR_MESSAGES[error.data.code]
}
```
