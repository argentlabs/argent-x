import type { PreferencesPayload } from "../../../shared/argentAccount/schema"
import type { IArgentAccountService } from "../../../shared/argentAccount/IArgentAccountService"

export interface IBackgroundArgentAccountService extends IArgentAccountService {
  updatePreferences(
    preferences: PreferencesPayload,
  ): Promise<PreferencesPayload>
}
