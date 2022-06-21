/** generic json fetcher */

import { privacyUseArgentServices } from "../settings"

export const fetcher = async (url: string) => {
  const response = await fetch(url)
  return await response.json()
}

/** fetch only if settings 'privacyUseArgentServices' is truthy */

export const argentServicesFetcher = async (url: string) => {
  if (!privacyUseArgentServices()) {
    return
  }
  return fetcher(url)
}
