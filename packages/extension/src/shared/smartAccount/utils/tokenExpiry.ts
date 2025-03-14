import { ARGENT_API_BASE_URL } from "../../api/constants"
import { IS_DEV } from "../../utils/dev"
import { coerceErrorToString } from "../../utils/error"
import { jwtFetcher } from "../jwtFetcher"
import urlJoin from "url-join"
import { idb } from "../idb"

export const checkTokenExpiry = async ({
  initiator,
}: {
  initiator: string
}) => {
  try {
    const headers: Record<string, string> = {
      "Argent-Initiator": initiator,
    }

    const res = await jwtFetcher<{ userId: string }>(
      urlJoin(ARGENT_API_BASE_URL, `account`),
      { headers },
    )

    await idb.ids.put({ key: "userId", id: res.userId })
    return { expired: false, userId: res.userId }
  } catch (error) {
    if (IS_DEV) {
      console.warn(coerceErrorToString(error))
    }
  }
  return { expired: true, userId: undefined }
}
