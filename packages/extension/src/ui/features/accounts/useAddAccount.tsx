import { useToast } from "@argent/ui"
import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { connectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { deployAccount } from "./accounts.service"

export const useAddAccount = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployFailed, setDeployFailed] = useState(false)
  const toast = useToast()

  const addAccount = useCallback(async () => {
    setIsDeploying(true)
    setDeployFailed(false)
    try {
      const newAccount = await deployAccount(switcherNetworkId)
      connectAccount(newAccount)
      navigate(await recover())
    } catch {
      setDeployFailed(true)
      toast({
        title: "Unable to create account. Please try again later.",
        status: "error",
        duration: 3000,
      })
    } finally {
      setIsDeploying(false)
    }
  }, [navigate, switcherNetworkId, toast])

  return { addAccount, isDeploying, deployFailed }
}
