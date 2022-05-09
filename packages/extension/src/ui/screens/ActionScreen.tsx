import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../shared/messages"
import { AddTokenScreen } from "../features/accountTokens/AddTokenScreen"
import { routes } from "../routes"
import { selectAccount, useAccount } from "../states/account"
import { useActions } from "../states/actions"
import { useAppState } from "../states/app"
import { ApproveSignScreen } from "./ApproveSignScreen"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ConnectScreen } from "./ConnectScreen"

const isPopup = new URLSearchParams(window.location.search).has("popup")

export const ActionScreen: FC = () => {
  const navigate = useNavigate()
  const account = useAccount(selectAccount)
  const { actions, approve, reject } = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1
  switch (action.type) {
    case "CONNECT_DAPP":
      return (
        <ConnectScreen
          host={action.payload.host}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) {
              window.close()
            }
          }}
          onSubmit={async () => {
            await approve(action)
            if (isPopup && isLastAction) {
              window.close()
            }
          }}
        />
      )

    case "REQUEST_TOKEN":
      return (
        <AddTokenScreen
          defaultToken={action.payload}
          hideBackButton
          onSubmit={async () => {
            await approve(action)
            if (isPopup && isLastAction) {
              window.close()
            }
          }}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) {
              window.close()
            }
          }}
        />
      )

    case "TRANSACTION":
      return (
        <ApproveTransactionScreen
          transactions={action.payload.transactions}
          actionHash={action.meta.hash}
          onSubmit={async () => {
            await approve(action)
            useAppState.setState({ isLoading: true })
            const result = await Promise.race([
              waitForMessage(
                "TRANSACTION_SUBMITTED",
                ({ data }) => data.actionHash === action.meta.hash,
              ),
              waitForMessage(
                "TRANSACTION_FAILED",
                ({ data }) => data.actionHash === action.meta.hash,
              ),
            ])
            if ("error" in result) {
              useAppState.setState({
                error: `Sending transaction failed: ${result.error}`,
                isLoading: false,
              })
              navigate(routes.error())
            } else {
              if (isPopup && isLastAction) {
                window.close()
              }
              useAppState.setState({ isLoading: false })
            }
          }}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) {
              window.close()
            }
          }}
          selectedAccount={account}
        />
      )

    case "SIGN":
      return (
        <ApproveSignScreen
          dataToSign={action.payload}
          onSubmit={async () => {
            await approve(action)
            useAppState.setState({ isLoading: true })
            await waitForMessage(
              "SIGNATURE_SUCCESS",
              ({ data }) => data.actionHash === action.meta.hash,
            )
            if (isPopup && isLastAction) {
              window.close()
            }
            useAppState.setState({ isLoading: false })
          }}
          onReject={async () => {
            await reject(action)
            if (isPopup && isLastAction) {
              window.close()
            }
          }}
          selectedAccount={account}
        />
      )
  }
}
