import urlJoin from "url-join"

import { ARGENT_API_BASE_URL } from "../../api/constants"
import { fetcherWithArgentApiHeaders } from "../../api/fetcher"

interface GetTimeResponse {
  time: number
}

export const getBackendTime = async () => {
  try {
    const fetcher = fetcherWithArgentApiHeaders()
    const { time } = await fetcher<GetTimeResponse>(
      urlJoin(ARGENT_API_BASE_URL, `time`),
    )
    return time
  } catch (error) {
    throw new Error("failed to request email verification")
  }
}

let _backendTimeSkew: number

export const getBackendTimeSkew = async () => {
  if (_backendTimeSkew !== undefined) {
    return _backendTimeSkew
  }
  const timeStart = new Date().getTime()
  const backendTime = await getBackendTime()
  const timeNow = new Date().getTime()
  const responseTime = (timeNow - timeStart) / 2
  const backendTimeNow = backendTime * 1000 + responseTime
  const backendTimeSkew = backendTimeNow - timeNow
  if (_backendTimeSkew) {
    console.log("Predicted backendTime", timeStart + backendTimeSkew)
    console.log("Predicted backendTimeNow", timeNow + backendTimeSkew)
  }
  _backendTimeSkew = backendTimeSkew
  console.log({
    timeStart,
    backendTime: backendTime * 1000,
    timeNow,
    responseTime,
    backendTimeNow,
    backendTimeSkew,
  })
  return _backendTimeSkew
}

export const getBackendTimeNow = async () => {
  const timeNow = new Date().getTime()
  const backendTimeSkew = await getBackendTimeSkew()
  return timeNow + backendTimeSkew
}
