import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { CreateAccountType, MultisigData } from "../../../shared/wallet.model"
import { useAppState } from "../../app.state"
import { selectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { Account } from "./Account"
import { createAccount, createMultisig } from "./accounts.service"

export interface AddAccountProps {
  type?: CreateAccountType
  skipNavigate?: boolean
  multisigPayload?: MultisigData
}

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
    async ({ type, multisigPayload, skipNavigate }: AddAccountProps) => {
      setIsAdding(true)
      setAddingFailed(false)
      try {
        let newAccount: Account

        if (type === "multisig") {
          newAccount = await createMultisig({
            networkId: switcherNetworkId,
            type,
            multisigPayload,
          })
        } else {
          newAccount = await createAccount({
            networkId: switcherNetworkId,
            type,
          })
        }

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
