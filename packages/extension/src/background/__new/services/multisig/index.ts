import BackgroundMultisigService from "./implementation"
import { walletSingleton } from "../../../walletSingleton"
import { backgroundActionService } from "../action"

export const backgroundMultisigService = new BackgroundMultisigService(
  walletSingleton,
  backgroundActionService,
)
