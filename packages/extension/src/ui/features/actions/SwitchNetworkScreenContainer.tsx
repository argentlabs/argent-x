import { FC } from "react"
import { useActionScreen } from "./hooks/useActionScreen"
import { useDappDisplayAttributes } from "./connectDapp/useDappDisplayAttributes"
import { AccountNavigationBarContainer } from "../accounts/AccountNavigationBarContainer"
import { SwitchNetworkScreen } from "./SwitchNetworkScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"

export const SwitchNetworkScreenContainer: FC = () => {
  const { action, selectedAccount, approveAndClose, reject } = useActionScreen()
  if (action?.type !== "REQUEST_SWITCH_CUSTOM_NETWORK") {
    throw new Error(
      "SwitchNetworkScreenContainer used with incompatible action.type",
    )
  }
  const host = action.meta.origin || ""
  const requestedNetwork = action.payload
  const dappDisplayAttributes = useDappDisplayAttributes(host)

  const fromNetworkTitle = selectedAccount?.network.name
  const toNetworkTitle = requestedNetwork.name

  const networkNavigationBar = (
    <AccountNavigationBarContainer
      showSettingsButton={false}
      showAccountButton={false}
    />
  )

  return (
    <SwitchNetworkScreen
      fromNetworkTitle={fromNetworkTitle}
      toNetworkTitle={toNetworkTitle}
      onSubmit={() => void approveAndClose()}
      onReject={() => void reject()}
      host={host}
      dappDisplayAttributes={dappDisplayAttributes}
      navigationBar={networkNavigationBar}
      footer={
        <>
          <WithActionScreenErrorFooter />
        </>
      }
    ></SwitchNetworkScreen>
  )
}
