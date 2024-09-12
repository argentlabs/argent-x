import { accountMessagingService } from "../services/accountMessaging"
import { sessionService } from "../services/session"

export const getSeedPhrase = async (password: string) => {
  if (!password) {
    throw new Error("Password is required")
  }

  try {
    await sessionService.startSession(password)

    return await accountMessagingService.getSeedPhrase()
  } catch {
    throw new Error("Invalid password")
  }
}

export const useGlobalUtilityMethods = () => {
  ;(window as any).getSeedPhrase = getSeedPhrase
}
