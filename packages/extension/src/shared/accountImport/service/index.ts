import { accountService } from "../../account/service"
import { networkService } from "../../network/service"
import { pkManager } from "../pkManager"
import { AccountImportSharedService } from "./AccountImportSharedService"

export const accountImportSharedService = new AccountImportSharedService(
  accountService,
  networkService,
  pkManager,
)
