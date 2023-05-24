import urlJoin from "url-join"

import { fetchData } from "./fetcher"

interface GetTimeResponse {
  time: number
}

/** backend time - at the time the response was generated - in seconds (aka 'epoch') -  */
export const getBackendTimeSeconds = async (
  apiUrl: string,
  apiHeaders?: Record<string, string>,
) => {
  try {
    const { time }: GetTimeResponse = await fetchData(urlJoin(apiUrl, `time`), {
      headers: apiHeaders,
    })
    return time
  } catch (error) {
    throw new Error("failed to request time")
  }
}

/** determine the expected backend time right now in seconds (aka 'epoch') */
export const getBackendTimeNowSeconds = async (
  apiUrl: string,
  apiHeaders?: Record<string, string>,
) => {
  const backendTimeSeconds = await getBackendTimeSeconds(apiUrl, apiHeaders)
  return Math.floor(backendTimeSeconds)
}
