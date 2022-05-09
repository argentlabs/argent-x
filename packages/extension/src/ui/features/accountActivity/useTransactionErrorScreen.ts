import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { messageStream } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"

export const useTransactionErrorScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "TRANSACTION_FAILURE") {
        const { failureReason } = message.data
        if (failureReason) {
          useAppState.setState({
            error: `${failureReason.code}: ${failureReason.error_message}`,
          })
          navigate(routes.error())
        }
      }
    })

    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  })
}
