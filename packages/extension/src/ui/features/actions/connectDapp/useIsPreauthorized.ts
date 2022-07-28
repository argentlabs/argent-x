import { useEffect, useState } from "react"

import { sendMessage, waitForMessage } from "../../../../shared/messages"
import { useOriginatingHost } from "../../browser/useOriginatingHost"

export const useIsPreauthorized = () => {
  const [isPreauthorized, setIsPreauthorized] = useState<boolean | undefined>()
  const originatingHost = useOriginatingHost()
  useEffect(() => {
    const init = async () => {
      if (originatingHost) {
        await sendMessage({
          type: "IS_PREAUTHORIZED",
          data: originatingHost,
        })
        const isPreauthorized = await waitForMessage("IS_PREAUTHORIZED_RES")
        setIsPreauthorized(isPreauthorized)
      }
    }
    init()
  }, [originatingHost])
  return isPreauthorized
}
