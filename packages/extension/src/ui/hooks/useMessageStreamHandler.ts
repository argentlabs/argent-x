import { useEffect } from "react"

import { messageStream } from "../../shared/messages/messages"
import { useResetAll } from "./useResetAll"
import { useStopSession } from "../services/useStopSession"

/** handle messages that affect all instances of the UI */

export const useMessageStreamHandler = () => {
  const resetAll = useResetAll()
  const stopSession = useStopSession()
  useEffect(() => {
    const subscription = messageStream.subscribe(([message]) => {
      switch (message.type) {
        case "STOP_SESSION":
          void stopSession()
          break
        case "RESET_ALL":
          resetAll()
          break
      }
    })
    return () => subscription.unsubscribe()
  }, [resetAll, stopSession])
}
