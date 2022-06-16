/** generic json fetcher */

export const fetcher = async (url: string) => {
  const response = await fetch(url)
  return await response.json()
}
