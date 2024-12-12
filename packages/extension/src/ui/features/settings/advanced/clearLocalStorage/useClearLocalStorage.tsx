import { sessionService } from "../../../../services/session"
import { accountMessagingService } from "../../../../services/accountMessaging"
import { useState } from "react"

export const useClearLocalStorage = (onSuccess: () => Promise<void> | void) => {
  const [isClearingStorage, setIsClearingStorage] = useState(false)
  const handleClearLocalStorage = async (password: string) => {
    try {
      await accountMessagingService.clearLocalStorageAndRecoverAccounts(
        password,
      )
      await onSuccess()
    } catch (e) {
      console.error(e)
    }
  }

  const verifyPasswordAndClearStorage = async (password: string) => {
    setIsClearingStorage(true)
    try {
      const isValid = await sessionService.checkPassword(password)
      if (isValid) {
        await handleClearLocalStorage(password)
      }
      setIsClearingStorage(false)
      return isValid
    } catch (e) {
      console.error(e)
      setIsClearingStorage(false)
      return false
    }
  }
  return {
    verifyPasswordAndClearStorage,
    handleClearLocalStorage,
    isClearingStorage,
  }
}
