import { nftWorkerStore } from "../../../../../shared/nft/worker/store"
import { chromeScheduleService } from "../../../../../shared/schedule"
import { old_walletStore } from "../../../../../shared/wallet/walletStore"
import { nftService } from "../../../../../ui/services/nfts"
import { transactionsStore } from "../../../../transactions/store"
import { sessionService, walletSingleton } from "../../../../walletSingleton"
import { backgroundUIService } from "../../ui"
import { NftsWorker } from "./implementation"

export const nftsWorker = new NftsWorker(
  nftService,
  chromeScheduleService,
  walletSingleton,
  old_walletStore,
  transactionsStore,
  sessionService,
  backgroundUIService,
  nftWorkerStore,
)
