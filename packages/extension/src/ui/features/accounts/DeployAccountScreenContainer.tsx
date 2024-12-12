import type { FC } from "react"
import { useCallback } from "react"

import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { DeployAccountScreen } from "./DeployAccountScreen"
import type { DeployAccountScreenContainerProps } from "./deployAccountScreen.model"
import { clientAccountService } from "../../services/account"
import { useActionScreen } from "../actions/hooks/useActionScreen"

export const DeployAccountScreenContainer: FC<
  DeployAccountScreenContainerProps
> = (props) => {
  const selectedAccount = useView(selectedAccountView)

  const { approve } = useActionScreen()
  const onActivate = useCallback(async () => {
    if (selectedAccount) {
      void clientAccountService.deploy(selectedAccount)
      await approve()
    }
  }, [selectedAccount, approve])

  if (!selectedAccount) {
    return null
  }

  return <DeployAccountScreen onActivate={() => void onActivate()} {...props} />
}
