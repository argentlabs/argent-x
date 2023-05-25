import { FC, useCallback } from "react"

import { accountService } from "../../../shared/account/service"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { ConfirmPageProps } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { DeployAccountScreen } from "./DeployAccountScreen"

export type DeployAccountScreenContainerProps = Omit<
  ConfirmPageProps,
  "onSubmit"
>

export const DeployAccountScreenContainer: FC<
  DeployAccountScreenContainerProps
> = (props) => {
  const selectedAccount = useView(selectedAccountView)

  const onActivate = useCallback(() => {
    if (selectedAccount) {
      void accountService.deploy(selectedAccount)
    }
  }, [selectedAccount])

  if (!selectedAccount) {
    return null
  }

  return <DeployAccountScreen onActivate={onActivate} {...props} />
}
