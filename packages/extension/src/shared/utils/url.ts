import urlJoin from "url-join"

export const getBaseUrlForHost = (host: string) => {
  try {
    const url = new URL(host)
    return url.origin
  } catch {
    // host is not a valid URL
  }
  try {
    const url = new URL(`https://${host}`)
    return url.origin
  } catch {
    // adding a protocol didn't make a valid URL
  }
  throw "Unable to make a base url from host"
}

export const urlWithQuery = (
  url: string | string[],
  query: Record<string, any>,
) => {
  return Array.isArray(url)
    ? addQueryToUrl(urlJoin(url), query)
    : addQueryToUrl(url, query)
}

export const addQueryToUrl = (url: string, query: Record<string, any>) => {
  let urlObj: URL
  let isTemporaryBase = false

  try {
    // Try to create a URL object directly
    urlObj = new URL(url)
  } catch {
    // If it fails, assume it's a pathname and create a temporary base URL
    urlObj = new URL(url, "https://example.com")
    isTemporaryBase = true
  }

  Object.entries(query).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  // If we used the temporary base, return only the pathname and search params
  if (isTemporaryBase) {
    return `${urlObj.pathname}${urlObj.search}`
  }

  return urlObj.toString()
}
