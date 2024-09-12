import { isError, isString, lowerCase, upperFirst } from "lodash-es"
import { z } from "zod"

import {
  UNKNOWN_ERROR_MESSAGE,
  getErrorObject,
} from "../../../../shared/utils/error"

export interface ParsedFeeError {
  title?: string
  message: string
}

/** Example payload of error from gateway (GatewayError) */

// {
//   "message": "Requested contract address 0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a is unavailable for deployment.",
//   "name": "GatewayError",
//   "errorCode": "StarknetErrorCode.CONTRACT_ADDRESS_UNAVAILABLE"
// }

const StarknetErrorCodePrefix = "StarknetErrorCode."

const gatewayErrorSchema = z.object({
  name: z.literal("GatewayError"),
  errorCode: z.string().startsWith(StarknetErrorCodePrefix),
  message: z.string(),
})

/** Example payload of error from fetcher (FetcherError) */

// {
//   "message": "An error occurred while fetching",
//   "name": "FetcherError",
//   "url": "https://api.example.com/",
//   "status": 400,
//   "statusText": "",
//   "responseText": "{\"status\":\"transactionFailurePredicted\",\"message\":\"Error …\"}",
//   "responseJson": {
//       "status": "transactionFailurePredicted",
//       "message": "Error …"
//   }
// }

const fetcherErrorSchema = z.object({
  name: z.literal("FetcherError"),
  responseJson: z.object({
    status: z.string(),
    message: z.string(),
  }),
})

export const genericErrorSchema = z.object({
  message: z.string(),
})

export const prettifyGatewayErrorCode = (value: string) => {
  try {
    /** extract code e.g. CONTRACT_ADDRESS_UNAVAILABLE */
    const code = value.substring(StarknetErrorCodePrefix.length)
    /** transform to Contract address unavailable */
    const prettyCode = upperFirst(lowerCase(code))
    return prettyCode
  } catch {
    /** ignore parsing error */
  }
  return value
}

export const prettifyFetcherErrorStatus = (status: string) => {
  try {
    /** Transform transactionFailurePredicted to Transaction failure predicted */
    const prettyStatus = upperFirst(lowerCase(status))
    return prettyStatus
  } catch {
    /** ignore parsing error */
  }
  return status
}

export const getParsedFeeError = (
  error?: string | Error | Record<string, string>,
): ParsedFeeError | undefined => {
  /** legacy string handling */
  if (isString(error)) {
    try {
      const regex = new RegExp("Error in the called contract", "g")
      const matchAll = [...error.matchAll(regex)]
      const message = error.slice(matchAll[1].index)
      return {
        message,
      }
    } catch {
      return {
        message: error,
      }
    }
  }

  /** convert into object to simplify  */
  if (isError(error)) {
    error = getErrorObject(error, false)
  }

  const gatewayError = gatewayErrorSchema.safeParse(error)
  if (gatewayError.success) {
    return {
      title: prettifyGatewayErrorCode(gatewayError.data.errorCode),
      message: gatewayError.data.message,
    }
  }

  const fetcherError = fetcherErrorSchema.safeParse(error)
  if (fetcherError.success) {
    return {
      title: prettifyFetcherErrorStatus(fetcherError.data.responseJson.status),
      message: fetcherError.data.responseJson.message,
    }
  }

  const genericError = genericErrorSchema.safeParse(error)
  if (genericError.success) {
    return {
      message: genericError.data.message,
    }
  }

  return {
    message: UNKNOWN_ERROR_MESSAGE,
  }
}
