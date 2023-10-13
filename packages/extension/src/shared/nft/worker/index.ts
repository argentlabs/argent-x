import { backgroundUIService } from "../../../background/__new/services/ui"
import { transactionsStore } from "../../../background/transactions/store"
import {
  sessionService,
  walletSingleton,
} from "../../../background/walletSingleton"
import { old_walletStore } from "../../../shared/wallet/walletStore"
import { nftService } from "../../../ui/services/nfts"
import { chromeScheduleService } from "../../schedule"
import { NftsWorker } from "./implementation"

export const nftsWorker = new NftsWorker(
  nftService,
  chromeScheduleService,
  walletSingleton,
  old_walletStore,
  transactionsStore,
  sessionService,
  backgroundUIService,
)
