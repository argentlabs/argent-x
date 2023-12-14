import { starknetChainService } from "../../chain/service"
import { accountRepo } from "../store"
import { AccountService } from "./implementation"

export const accountService = new AccountService(
  starknetChainService,
  accountRepo,
)
