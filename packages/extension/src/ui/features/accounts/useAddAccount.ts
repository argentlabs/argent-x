import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { selectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { createAccount } from "./accounts.service"

export const useAddAccount = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const [isAdding, setIsAdding] = useState(false)
  const [addingFailed, setAddingFailed] = useState(false)

  useEffect(() => {
    // clear deploy status when network changes
    setAddingFailed(false)
  }, [switcherNetworkId])

  const addAccount = useCallback(async () => {
    setIsAdding(true)
    setAddingFailed(false)
    try {
      const newAccount = await createAccount(switcherNetworkId)
      // switch background wallet to the account that was selected
      await selectAccount(newAccount)
      navigate(await recover())
    } catch {
      setAddingFailed(true)
    } finally {
      setIsAdding(false)
    }
  }, [navigate, switcherNetworkId])

  return { addAccount, isAdding, addingFailed }
}
