import BackgroundArgentAccountService from "./implementation"
import { walletSingleton } from "../../../walletSingleton"
import { httpService } from "../../../../shared/http/singleton"

export const backgroundArgentAccountService =
  new BackgroundArgentAccountService(walletSingleton, httpService)
