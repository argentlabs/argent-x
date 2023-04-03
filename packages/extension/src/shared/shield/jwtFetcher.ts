import { fetcherWithArgentApiHeaders } from "../api/fetcher"
import { IS_DEV } from "../utils/dev"
import { coerceErrorToString } from "../utils/error"
import { generateJwt } from "./jwt"

/** wraps fetcher, generates and uses bearer jwt */

export const jwtFetcher = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const jwt = await generateJwt()
  const initWithArgentJwtHeaders = {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
  }
  const fetcher = fetcherWithArgentApiHeaders()
  try {
    return fetcher<T>(input, initWithArgentJwtHeaders)
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
    throw error
  }
}
