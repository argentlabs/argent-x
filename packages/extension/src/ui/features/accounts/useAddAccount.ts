import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { connectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { createAccount } from "./accounts.service"
import { useSelectedAccountStore } from "./accounts.state"

export const useAddAccount = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployFailed, setDeployFailed] = useState(false)

  useEffect(() => {
    // clear deploy status when network changes
    setDeployFailed(false)
  }, [switcherNetworkId])

  const addAccount = useCallback(async () => {
    setIsDeploying(true)
    setDeployFailed(false)
    try {
      const newAccount = await createAccount(switcherNetworkId)
      // switch UI to the account that was selected
      useSelectedAccountStore.setState({
        selectedAccount: newAccount,
      })
      // switch background wallet to the account that was selected
      connectAccount(newAccount)
      await waitForMessage("CONNECT_ACCOUNT_RES")
      navigate(await recover())
    } catch {
      setDeployFailed(true)
    } finally {
      setIsDeploying(false)
    }
  }, [navigate, switcherNetworkId])

  return { addAccount, isDeploying, deployFailed }
}
