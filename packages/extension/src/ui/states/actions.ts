import { useEffect } from "react"
import usePromise from "react-promise-suspense"
import create from "zustand"

import { ExtActionItem } from "../../shared/actionQueue"
import { messageStream, sendMessage } from "../../shared/messages"
import { getActions } from "../utils/messaging"

interface State {
  actions: ExtActionItem[]
  approve: (action: ExtActionItem | string) => Promise<void>
  reject: (action: ExtActionItem | string) => Promise<void>
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
  const actions: ExtActionItem[] = usePromise(() => getActions(), [])

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
