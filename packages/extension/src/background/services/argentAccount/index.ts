import BackgroundArgentAccountService from "./BackgroundArgentAccountService"
import { walletSingleton } from "../../walletSingleton"
import { httpService } from "../../../shared/http/singleton"
import { accountSharedService } from "../../../shared/account/service"

export const backgroundArgentAccountService =
  new BackgroundArgentAccountService(
    walletSingleton,
    httpService,
    accountSharedService,
  )
