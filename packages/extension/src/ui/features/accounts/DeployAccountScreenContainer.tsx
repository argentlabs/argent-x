import { FC, useCallback } from "react"

import { accountService } from "../../../shared/account/service"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { DeployAccountScreen } from "./DeployAccountScreen"
import { DeployAccountScreenContainerProps } from "./deployAccountScreen.model"

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
