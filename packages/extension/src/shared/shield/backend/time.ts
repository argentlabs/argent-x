import urlJoin from "url-join"

import { ARGENT_API_BASE_URL } from "../../api/constants"
import { fetcherWithArgentApiHeaders } from "../../api/fetcher"

interface GetTimeResponse {
  time: number
}

/** backend time - at the time the response was generated - in seconds (aka 'epoch') -  */

export const getBackendTimeSeconds = async () => {
  try {
    const fetcher = fetcherWithArgentApiHeaders()
    const { time } = await fetcher<GetTimeResponse>(
      urlJoin(ARGENT_API_BASE_URL, `time`),
    )
    return time
  } catch (error) {
    throw new Error("failed to request time")
  }
}

/** determine skew (difference) between local time and backend time */

export const getBackendTimeSkew = async () => {
  const timeStart = new Date().getTime()
  const backendTimeSeconds = await getBackendTimeSeconds()
  const timeNow = new Date().getTime()
  /** average how long it took for one hop client -> server, or server -> client */
  const responseTime = (timeNow - timeStart) / 2
  /** approximate what backend time should be right now */
  const backendTimeNow = backendTimeSeconds * 1000 + responseTime
  /** determine skew (difference) between local time and backend time */
  const backendTimeSkew = backendTimeNow - timeNow
  return backendTimeSkew
}

/** determine the expected backend time right now in seconds (aka 'epoch') */

export const getBackendTimeNowSeconds = async () => {
  const backendTimeSkew = await getBackendTimeSkew()
  const timeNow = new Date().getTime()
  const backendTimeNow = timeNow + backendTimeSkew
  /** conver to epoch */
  return Math.floor(backendTimeNow / 1000)
}
