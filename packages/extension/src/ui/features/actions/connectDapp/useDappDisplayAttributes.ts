import useSWRImmutable from "swr/immutable"

import { generateAvatarImage } from "../../../../shared/avatarImage"
import { getKnownDappForHost } from "../../../../shared/knownDapps"
import { getColor } from "../../accounts/accounts.service"

interface DappDisplayAttributes {
  title: string
  iconUrl: string
}

export const getDappDisplayAttributes = async (
  host: string,
): Promise<DappDisplayAttributes> => {
  const background = getColor(host)
  const knownDapp = getKnownDappForHost(host)
  console.log(JSON.stringify({ host, knownDapp }))
  const title = knownDapp?.title || host
  const iconUrl = knownDapp?.icon || generateAvatarImage(title, { background })
  const result: DappDisplayAttributes = {
    title,
    iconUrl,
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
