import { FC } from "react"

import { waitForMessage } from "../../shared/messages"
import { useActions } from "../states/actions"
import { selectAccountNumber, useGlobalState } from "../states/global"
import { AddTokenScreen } from "./AddTokenScreen"
import { ApproveSignScreen } from "./ApproveSignScreen"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ConnectScreen } from "./ConnectScreen"

const isPopup = new URLSearchParams(window.location.search).has("popup")

export const ActionScreen: FC = () => {
  const { switcherNetworkId } = useGlobalState()
  const accountNumber = useGlobalState(selectAccountNumber)
  const { actions, approve, reject } = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1
  switch (action.type) {
    case "CONNECT":
      return (
        <ConnectScreen
          host={action.payload.host}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) window.close()
          }}
          onSubmit={async () => {
            await approve(action)
            if (isPopup && isLastAction) window.close()
          }}
        />
      )
    case "ADD_TOKEN":
      return (
        <AddTokenScreen
          defaultToken={action.payload}
          onSubmit={async () => {
            await approve(action)
            if (isPopup && isLastAction) window.close()
          }}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) window.close()
          }}
        />
      )

    case "TRANSACTION":
      return (
        <ApproveTransactionScreen
          transaction={action.payload}
          onSubmit={async () => {
            await approve(action)
            useGlobalState.setState({ showLoading: true })
            await waitForMessage(
              "SUBMITTED_TX",
              ({ data }) => data.actionHash === action.meta.hash,
            )
            if (isPopup && isLastAction) window.close()
            useGlobalState.setState({ showLoading: false })
          }}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) window.close()
          }}
          selectedAccount={{ accountNumber, networkId: switcherNetworkId }}
        />
      )
    case "SIGN":
      return (
        <ApproveSignScreen
          dataToSign={action.payload}
          onSubmit={async () => {
            await approve(action)
            useGlobalState.setState({ showLoading: true })
            await waitForMessage(
              "SUCCESS_SIGN",
              ({ data }) => data.actionHash === action.meta.hash,
            )
            if (isPopup && isLastAction) window.close()
            useGlobalState.setState({ showLoading: false })
          }}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) window.close()
          }}
          selectedAccount={{ accountNumber, networkId: switcherNetworkId }}
        />
      )
  }
}
