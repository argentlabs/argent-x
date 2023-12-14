import { FC } from "react"

import { AddNetworkScreenContainer } from "./AddNetworkScreen/AddNetworkScreenContainer"
import { AddTokenActionScreenContainer } from "./AddTokenActionScreenContainer"
import { ConnectDappScreenContainer } from "./connectDapp/ConnectDappScreenContainer"
import { DeclareContractActionScreenContainer } from "./DeclareContractActionScreenContainer"
import { DeployAccountActionScreenContainer } from "./DeployAccountActionScreenContainer"
import { DeployContractActionScreenContainer } from "./DeployContractActionScreenContainer"
import { DeployMultisigActionScreenContainer } from "./DeployMultisigActionScreenContainer"
import { useActionScreen } from "./hooks/useActionScreen"
import { TransactionActionScreenContainerV2 } from "./transactionV2/TransactionActionScreenContainerV2"
import { SignActionScreenContainerV2 } from "./transactionV2/SignActionScreenContainerV2"

/** TODO: refactor: actual file should be renamed `ActionScreenContainer.tsx` */

export const ActionScreenContainer: FC = () => {
  const { action } = useActionScreen()
  switch (action?.type) {
    case "CONNECT_DAPP":
      return <ConnectDappScreenContainer />

    case "REQUEST_TOKEN":
      return <AddTokenActionScreenContainer />

    case "REQUEST_ADD_CUSTOM_NETWORK":
      return <AddNetworkScreenContainer mode="add" />

    case "REQUEST_SWITCH_CUSTOM_NETWORK":
      return <AddNetworkScreenContainer mode="switch" />

    case "TRANSACTION":
      return <TransactionActionScreenContainerV2 />

    case "DEPLOY_ACCOUNT":
      return <DeployAccountActionScreenContainer />

    case "DEPLOY_MULTISIG":
      return <DeployMultisigActionScreenContainer />

    case "SIGN":
      return <SignActionScreenContainerV2 />

    case "DECLARE_CONTRACT":
      return <DeclareContractActionScreenContainer />

    case "DEPLOY_CONTRACT":
      return <DeployContractActionScreenContainer />

    default:
      return null
  }
}
