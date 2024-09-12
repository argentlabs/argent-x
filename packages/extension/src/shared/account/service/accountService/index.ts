import { starknetChainService } from "../../../chain/service"
import { accountRepo } from "../../store"
import { AccountService } from "./AccountService"

export const accountService = new AccountService(
  starknetChainService,
  accountRepo,
)
