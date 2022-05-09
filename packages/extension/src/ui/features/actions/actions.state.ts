import { useEffect } from "react"
import useSWRImmutable from "swr/immutable"
import create from "zustand"

import { ExtensionActionItem } from "../../../shared/actionQueue"
import { messageStream, sendMessage } from "../../../shared/messages"
import { getActions } from "../../utils/messaging"

interface State {
  actions: ExtensionActionItem[]
  approve: (action: ExtensionActionItem | string) => Promise<void>
  reject: (action: ExtensionActionItem | string) => Promise<void>
}

export const useActions = create<State>(() => ({
  actions: [],
  approve: (action) => {
    const actionHash = typeof action === "string" ? action : action.meta.hash
    return sendMessage({
      type: "APPROVE_ACTION",
      data: {
        actionHash,
      },
    })
  },
  reject: (action) => {
    const actionHash = typeof action === "string" ? action : action.meta.hash
    return sendMessage({
      type: "REJECT_ACTION",
      data: {
        actionHash,
      },
    })
  },
}))

export const useActionsSubscription = () => {
  const { data: actions = [] } = useSWRImmutable(
    "actions",
    () => getActions(),
    { suspense: true },
  )

  useEffect(() => {
    useActions.setState({ actions })

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
