import { nftService } from "../../../../shared/nft"
import { debounceService } from "../../../../shared/debounce"
import { chromeScheduleService } from "../../../../shared/schedule"
import { old_walletStore } from "../../../../shared/wallet/walletStore"
import {
  recoverySharedService,
  sessionService,
  walletSingleton,
} from "../../../walletSingleton"
import { backgroundUIService } from "../../ui"
import { NftsWorker } from "./NftsWorker"
import { activityService } from "../../activity"

export const nftsWorker = new NftsWorker(
  nftService,
  chromeScheduleService,
  walletSingleton,
  old_walletStore,
  activityService,
  sessionService,
  backgroundUIService,
  debounceService,
  recoverySharedService,
)
