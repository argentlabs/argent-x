import Emittery from "emittery"
import { pkManager } from "../../../accountImport/pkManager"
import { starknetChainService } from "../../../chain/service"
import { accountRepo } from "../../store"
import { AccountService } from "./AccountService"
import type { Events } from "./IAccountService"

const emitter = new Emittery<Events>()

export const accountService = new AccountService(
  emitter,
  starknetChainService,
  accountRepo,
  pkManager,
)
