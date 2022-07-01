/** generic json fetcher */

export const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, init)
  const json = await response.json()
  return json
}
