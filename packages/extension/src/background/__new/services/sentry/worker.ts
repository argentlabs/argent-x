import * as Sentry from "@sentry/browser"

import { ISettingsStorage } from "../../../../shared/settings/types"
import { KeyValueStorage } from "../../../../shared/storage"

export class SentryWorker {
  constructor(
    private readonly baseSentryOptions: Sentry.BrowserOptions,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {
    // init Sentry immediately to capture any exceptions on startup
    Sentry.init({
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
    Sentry.init({
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
