import urlJoin from "url-join"

export const getBaseUrlForHost = (host: string) => {
  try {
    const url = new URL(host)
    return url.origin
  } catch (e) {
    // host is not a valid URL
  }
  try {
    const url = new URL(`https://${host}`)
    return url.origin
  } catch (e) {
    // adding a protocol didn't make a valid URL
  }
  throw "Unable to make a base url from host"
}

export const urlWithQuery = (
  url: string | string[],
  query: Record<string, any>,
) => {
  const searchParams = new URLSearchParams(query)
  const urlWithQuery = Array.isArray(url)
    ? urlJoin(...url, `?${searchParams}`)
    : urlJoin(url, `?${searchParams}`)
  return urlWithQuery
}
