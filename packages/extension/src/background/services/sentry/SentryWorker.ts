import type { KeyValueStorage } from "../../../shared/storage"
import type { ISettingsStorage } from "../../../shared/settings/types"
import type {
  BrowserClientOptions,
  BrowserExtensionSentryInit,
} from "../../../shared/sentry/types"

export class SentryWorker {
  constructor(
    private readonly browserExtensionSentryInitImpl: BrowserExtensionSentryInit,
    private readonly baseSentryOptions: BrowserClientOptions,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {
    // init Sentry immediately to capture any exceptions on startup
    this.browserExtensionSentryInitImpl({
      ...this.baseSentryOptions,
      enabled: true,
    })
    this.settingsStore.subscribe(
      "privacyErrorReporting",
      this.onSettingsStoreChange.bind(this),
    )
    this.settingsStore.subscribe(
      "privacyAutomaticErrorReporting",
      this.onSettingsStoreChange.bind(this),
    )
    // re-init with async preferences
    void this.initSentry()
  }

  onSettingsStoreChange() {
    void this.initSentry()
  }

  async initSentry() {
    const privacyErrorReporting = await this.settingsStore.get(
      "privacyErrorReporting",
    )
    const privacyAutomaticErrorReporting = await this.settingsStore.get(
      "privacyAutomaticErrorReporting",
    )
    this.browserExtensionSentryInitImpl({
      ...this.baseSentryOptions,
      enabled: privacyErrorReporting,
      beforeSend(event) {
        if (privacyAutomaticErrorReporting) {
          return event
        }
        return null
      },
    })
  }
}
