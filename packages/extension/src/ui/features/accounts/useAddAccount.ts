import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { CreateAccountType } from "../../../shared/wallet.model"
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

  const addAccount = useCallback(
    async (type?: CreateAccountType, skipNavigate = true) => {
      setIsAdding(true)
      setAddingFailed(false)
      try {
        const newAccount = await createAccount({
          networkId: switcherNetworkId,
          type,
        })
        // switch background wallet to the account that was selected
        await selectAccount(newAccount)

        // if skipNavigate is true, we don't want to navigate to the accounts page.
        // handle navigation in the caller
        if (!skipNavigate) {
          navigate(await recover({ showAccountList: true }))
        }

        return newAccount
      } catch {
        setAddingFailed(true)
      } finally {
        setIsAdding(false)
      }
    },
    [navigate, switcherNetworkId],
  )

  return { addAccount, isAdding, addingFailed }
}
