import urlJoin from "url-join"

import { ARGENT_API_BASE_URL } from "../../api/constants"
import { fetcherWithArgentApiHeaders } from "../../api/fetcher"

interface GetTimeResponse {
  time: number
}

/** backend time - at the time the response was generated - in seconds (aka 'epoch') -  */

export const getBackendTimeSeconds = async () => {
  try {
    const fetcher = await fetcherWithArgentApiHeaders()
    const { time } = await fetcher<GetTimeResponse>(
      urlJoin(ARGENT_API_BASE_URL, `time`),
    )
    return time
  } catch (error) {
    throw new Error("failed to request time")
  }
}

/** determine the expected backend time right now in seconds (aka 'epoch') */

export const getBackendTimeNowSeconds = async () => {
  const backendTimeSeconds = await getBackendTimeSeconds()
  return Math.floor(backendTimeSeconds)
}
