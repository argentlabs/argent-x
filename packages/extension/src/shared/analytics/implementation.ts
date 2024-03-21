import { Ampli, Event, EventOptions, PromiseResult, Result } from "../../ampli"
import { WalletAccountSharedService } from "../account/service/shared.service"
import { isProd } from "../api/constants"
import { ISettingsStorage } from "../settings/types"
import { KeyValueStorage } from "../storage"

const getVoidPromiseResult = () => ({ promise: Promise.resolve() })

export class AnalyticsService extends Ampli {
  constructor(
    private accountSharedService: WalletAccountSharedService,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {
    super()
  }

  track(event: Event, options?: EventOptions): PromiseResult<Result> {
    if (!super.isLoaded) {
      return getVoidPromiseResult()
    }

    return {
      promise: this.accountSharedService
        .getSelectedAccount()
        .then((account) => {
          this.settingsStore
            .get("privacyShareAnalyticsData")
            .then((isShareAnalyticsDataEnabled) => {
              if (
                isShareAnalyticsDataEnabled &&
                isProd &&
                ((account && account.networkId === "mainnet-alpha") || !account)
              ) {
                return super.track(event, options).promise
              } else {
                return
              }
            })
            .catch((_error) => {
              return
            })
        })
        .catch((_error) => {
          return
        }),
    }
  }
}
