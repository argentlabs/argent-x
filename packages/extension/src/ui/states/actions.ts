import { useEffect } from "react"
import usePromise from "react-promise-suspense"
import create, { StateSelector, StoreApi, UseBoundStore } from "zustand"

import { ExtActionItem } from "../../shared/actionQueue"
import { messageStream, sendMessage } from "../../shared/messages"
import { getActions } from "../utils/messaging"

interface ActionsStore {
  actions: ExtActionItem[]
  approve: (action: ExtActionItem | string) => Promise<void>
  reject: (action: ExtActionItem | string) => Promise<void>
}

const useActionsStore = create<ActionsStore>(() => ({
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

export const useActions = () => {
  const actions: ExtActionItem[] = usePromise(() => getActions(), [])

  useEffect(() => {
    useActionsStore.setState({ actions })

    const { unsubscribe } = messageStream.subscribe(([message]) => {
      if (message.type === "ACTIONS_QUEUE_UPDATE") {
        useActionsStore.setState({ actions: message.data.actions })
      }
    })

    return unsubscribe
  }, [])

  return useActionsStore()
}
