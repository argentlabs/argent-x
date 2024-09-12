import BackgroundMultisigService from "./BackgroundMultisigService"
import { walletSingleton } from "../../walletSingleton"
import { backgroundActionService } from "../action"

export const backgroundMultisigService = new BackgroundMultisigService(
  walletSingleton,
  backgroundActionService,
)
