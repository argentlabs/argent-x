import BackgroundArgentAccountService from "./BackgroundArgentAccountService"
import { walletSingleton } from "../../walletSingleton"
import { httpService } from "../../../shared/http/singleton"
import { accountSharedService } from "../../../shared/account/service"
import { backgroundActionService } from "../action"
export const backgroundArgentAccountService =
  new BackgroundArgentAccountService(
    walletSingleton,
    httpService,
    accountSharedService,
    backgroundActionService,
  )
