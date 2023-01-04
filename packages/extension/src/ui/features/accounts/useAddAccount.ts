import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { selectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { createAccount } from "./accounts.service"

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
      // switch background wallet to the account that was selected
      await selectAccount(newAccount)
      navigate(await recover())
    } catch {
      setDeployFailed(true)
    } finally {
      setIsDeploying(false)
    }
  }, [navigate, switcherNetworkId])

  return { addAccount, isDeploying, deployFailed }
}
