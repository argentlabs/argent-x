import {
  AnyRootConfig,
  MiddlewareFunction,
  ProcedureParams,
  TRPCError,
} from "@trpc/server"

import type { Events } from "../../../shared/analytics"
import { analytics } from "../../analytics"

type AnyProduceParams = ProcedureParams<
  AnyRootConfig,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>

type SuccessArg<T extends AnyProduceParams> = {
  input: T["_input_out"]
  ctx: T["_ctx_out"]
  output: T["_output_out"]
}
type ErrorArg<T extends AnyProduceParams> = {
  input: T["_input_out"]
  ctx: T["_ctx_out"]
  error: TRPCError
}

export function trackMiddleware<
  T extends keyof Events,
  Params extends AnyProduceParams,
>(
  event: T,
  ...[successFn, errorFn]: Events[T] extends undefined // this simplification needs a body, otherwise you can not differentiate between error and success
    ? never
    : [
        successFn: (arg: SuccessArg<Params>) => Events[T],
        error?: (arg: ErrorArg<Params>) => Events[T],
      ]
): MiddlewareFunction<Params, AnyProduceParams> {
  return async ({ next, ...ctx }) => {
    const result = await next()

    try {
      if (result.ok) {
        const successPayload = successFn?.({ ...ctx, output: result.data })
        if (successPayload) {
          void analytics.track(event, successPayload)
        }
      } else {
        const errorPayload = errorFn?.({ ...ctx, error: result.error })
        if (errorPayload) {
          void analytics.track(event, errorPayload)
        }
      }
    } catch {
      console.warn("Error in trackMiddleware", event)
    }

    return result
  }
}
