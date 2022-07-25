import { useEffect, useState } from "react"

import { getWindowLocationHost } from "../../../shared/browser/host"
import {
  EXTENSION_IS_POPUP,
  EXTENSION_POPUP_ORIGINATING_HOST,
} from "./constants"

export const getOriginatingHost = async () => {
  if (EXTENSION_IS_POPUP) {
    return EXTENSION_POPUP_ORIGINATING_HOST
  }
  const originatingHost = await getWindowLocationHost()
  return originatingHost
}

export const useOriginatingHost = () => {
  const [host, setHost] = useState<string | undefined>()
  useEffect(() => {
    const init = async () => {
      const originatingHost = await getOriginatingHost()
      setHost(originatingHost)
    }
    init()
  }, [])
  return host
}
