import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { deleteAccount } from "../../services/messaging"
import { Account } from "../accounts/Account"
import { useAccounts } from "../accounts/accounts.state"

export const useHideAccountCallback = () => {
  const { hideAccount } = useAccounts()
  const navigate = useNavigate()

  return useCallback(async (account: Account) => {
    hideAccount(account)
    await deleteAccount(account.address)
    navigate(routes.accounts())
  }, [])
}
