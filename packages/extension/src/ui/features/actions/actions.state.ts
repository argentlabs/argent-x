import { useEffect } from "react"
import create from "zustand"

import { ExtensionActionItem } from "../../../shared/actionQueue"
import { messageStream } from "../../../shared/messages"
import { getActions } from "../../services/backgroundActions"

interface State {
  actions: ExtensionActionItem[]
}

export const useActions = create<State>(() => ({ actions: [] }))

export const useActionsSubscription = () => {
  useEffect(() => {
    ;(async () => {
      const actions = await getActions()
      useActions.setState({ actions })
    })()

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "ACTIONS_QUEUE_UPDATE") {
        useActions.setState({ actions: message.data.actions })
      }
    })

    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  }, [])
}
