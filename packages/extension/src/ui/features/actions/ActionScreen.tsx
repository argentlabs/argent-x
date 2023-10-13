import { FC } from "react"

import { AddNetworkScreenContainer } from "./AddNetworkScreen/AddNetworkScreenContainer"
import { AddTokenActionScreenContainer } from "./AddTokenActionScreenContainer"
import { ConnectDappScreenContainer } from "./connectDapp/ConnectDappScreenContainer"
import { DeclareContractActionScreenContainer } from "./DeclareContractActionScreenContainer"
import { DeployAccountActionScreenContainer } from "./DeployAccountActionScreenContainer"
import { DeployContractActionScreenContainer } from "./DeployContractActionScreenContainer"
import { DeployMultisigActionScreenContainer } from "./DeployMultisigActionScreenContainer"
import { useActionScreen } from "./hooks/useActionScreen"
import { SignActionScreenContainer } from "./SignActionScreenContainer"
import { TransactionActionScreenContainer } from "./TransactionActionScreenContainer"

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
      return <TransactionActionScreenContainer />

    case "DEPLOY_ACCOUNT_ACTION":
      return <DeployAccountActionScreenContainer />

    case "DEPLOY_MULTISIG_ACTION":
      return <DeployMultisigActionScreenContainer />

    case "SIGN":
      return <SignActionScreenContainer />

    case "DECLARE_CONTRACT_ACTION":
      return <DeclareContractActionScreenContainer />

    case "DEPLOY_CONTRACT_ACTION":
      return <DeployContractActionScreenContainer />

    default:
      return null
  }
}
