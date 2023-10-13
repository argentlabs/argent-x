import { PreferencesPayload } from "../../../background/__new/procedures/argentAccount/updatePreferences.model"
import { EmailPreferences } from "../../../ui/services/argentAccount/utils"

interface IArgentAccountService {
  addAccount(): Promise<string>
  validateAccount(): Promise<void>
  confirmEmail(code: string): Promise<void>
  requestEmail(email: string): Promise<void>
  isTokenExpired(): Promise<boolean>
  getPreferences(): Promise<PreferencesPayload | undefined>
}

export interface IArgentAccountServiceUI extends IArgentAccountService {
  updateEmailPreferences(
    emailPreferences: EmailPreferences,
  ): Promise<PreferencesPayload | undefined>
}

export interface IArgentAccountServiceBackground extends IArgentAccountService {
  updatePreferences(
    preferences: PreferencesPayload,
  ): Promise<PreferencesPayload>
}
