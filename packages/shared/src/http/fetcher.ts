export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<any>

export interface FetcherError extends Error {
  url?: string
  status?: number
  statusText?: string
  responseText?: string
  responseJson?: any
}

export const fetcherError = (
  message: string,
  response: Response,
  responseText: string,
) => {
  const error: FetcherError = new Error(message)
  error.name = "FetcherError"
  error.url = response.url
  error.status = response.status
  error.statusText = response.statusText
  error.responseText = responseText
  try {
    const reponseJson = JSON.parse(responseText)
    error.responseJson = reponseJson
  } catch {
    // ignore error
  }
  return error
}

export const fetchData = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const response = await fetch(input, init)
  const responseText = await response.text()
  if (!response.ok) {
    throw fetcherError(
      "An error occurred while fetching",
      response,
      responseText,
    )
  }
  try {
    const json = JSON.parse(responseText)
    return json
  } catch (parseError) {
    throw fetcherError(
      "An error occurred while parsing",
      response,
      responseText,
    )
  }
}

export const postData = async (
  input: RequestInfo | URL,
  init: Omit<RequestInit, "method">,
) => {
  const response = await fetch(input, {
    method: "POST",
    ...init,
  })
  const responseText = await response.text()
  if (!response.ok) {
    throw fetcherError(
      "An error occurred while fetching",
      response,
      responseText,
    )
  }

  try {
    const json = JSON.parse(responseText)
    return json
  } catch (parseError) {
    throw fetcherError(
      "An error occurred while parsing",
      response,
      responseText,
    )
  }
}
