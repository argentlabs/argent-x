import urlJoin from "url-join"

import { ARGENT_MULTISIG_URL } from "../shared/api/constants"
import { fetcher } from "../shared/api/fetcher"

export const getMultisigAccountData = async ({
  address,
  networkId,
}: {
  address: string
  networkId: string
}) => {
  try {
    if (!ARGENT_MULTISIG_URL) {
      throw "Multisig endpoint is not defined"
    }
    urlJoin(ARGENT_MULTISIG_URL, `${networkId}/${address}`)
    return fetcher<{
      content: {
        address: string
        creator: string
        signers: string[]
        threshold: number
      }
    }>(ARGENT_MULTISIG_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    throw `An error occured ${e}`
  }
}
