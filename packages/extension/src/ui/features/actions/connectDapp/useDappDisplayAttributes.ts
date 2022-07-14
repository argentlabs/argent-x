import useSWRImmutable from "swr/immutable"
import urlJoin from "url-join"

import { getBaseUrlForHost } from "../../../../shared/utils/host"
import { getColor } from "../../accounts/accounts.service"

export interface IDappDisplayAttributes {
  title: string
  iconUrl: string
}

export const getDappDisplayAttributes = async (
  host: string,
): Promise<IDappDisplayAttributes> => {
  const color = getColor(host)
  const result: IDappDisplayAttributes = {
    title: host,
    iconUrl: `https://eu.ui-avatars.com/api?name=${host}&background=${color}&color=fff`,
  }

  try {
    /** TODO: this will fail for sites without CORS, could proxy through e.g. https://www.npmjs.com/package/cors-anywhere */
    const baseUrl = getBaseUrlForHost(host)
    const response = await fetch(baseUrl)
    const source = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(source, "text/html")

    const titleTag = doc.querySelector("title")
    if (titleTag) {
      result.title = titleTag.innerText
    }

    const favIcon = doc.querySelector('link[rel="shortcut icon"]')
    const appleTouchIcons = doc.querySelectorAll(
      'link[rel^="apple-touch-icon"]',
    )
    let favIconHref, appleTouchIconHref
    if (favIcon) {
      const href = favIcon.getAttribute("href")
      if (href) {
        favIconHref = href
      }
    }
    if (appleTouchIcons) {
      let largestSize = 0
      appleTouchIcons.forEach((appleTouchIcon) => {
        const href = appleTouchIcon.getAttribute("href")
        const sizes = appleTouchIcon.getAttribute("sizes")
        if (href && sizes) {
          const size = parseInt(sizes)
          if (size > largestSize) {
            largestSize = size
            appleTouchIconHref = href
          }
        }
      })
    }
    if (appleTouchIconHref) {
      result.iconUrl = urlJoin(baseUrl, appleTouchIconHref)
    } else if (favIconHref) {
      result.iconUrl = urlJoin(baseUrl, favIconHref)
    }
  } catch (e) {
    // ignore error
  }
  return result
}

export const useDappDisplayAttributes = (host: string) => {
  const { data } = useSWRImmutable(
    [host, "dappDisplayAttributes"],
    getDappDisplayAttributes,
  )
  return data
}
