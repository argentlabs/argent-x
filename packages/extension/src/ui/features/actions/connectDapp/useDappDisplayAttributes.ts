import { generateAvatarImage } from "@argent/x-shared"
import { getKnownDappForHost } from "../../../../shared/knownDapps"
import { getColor } from "../../accounts/accounts.service"
import { useDappFromKnownDappsByHost } from "../../../services/knownDapps"
import { upperFirst } from "lodash-es"

export interface DappDisplayAttributes {
  title?: string
  iconUrl?: string
  isKnown: boolean
  dapplandUrl?: string
  verified?: boolean
}

const getFavicon = (host: string) => {
  return `https://www.google.com/s2/favicons?sz=64&domain=${host}`
}

export const getDappDisplayAttributes = (
  host: string,
): DappDisplayAttributes => {
  const background = getColor(host)
  const knownDapp = getKnownDappForHost(host)
  const title = knownDapp?.title || host
  const iconUrl =
    knownDapp?.icon ||
    getFavicon(host) ||
    generateAvatarImage(title, { background })

  const result: DappDisplayAttributes = {
    title,
    iconUrl,
    isKnown: !!knownDapp,
  }

  return result
}

export const useDappDisplayAttributes = (host: string) => {
  const dapp = useDappFromKnownDappsByHost(host)

  const title = dapp?.name ? upperFirst(dapp.name) : undefined

  const iconUrl = dapp?.logoUrl

  const result: DappDisplayAttributes = {
    title,
    iconUrl,
    isKnown: !!dapp,
    dapplandUrl: dapp?.dappland,
    verified: dapp?.argentVerified,
  }

  return result
}
