import { ARGENT_TOKENS_DEFI_INVESTMENTS_URL } from "../../../shared/api/constants"
import { httpService } from "../../../shared/http/singleton"
import { argentDb } from "../../../shared/idb/argentDb"
import { InvestmentService } from "./InvestmentService"
import { stakingStore } from "../../../shared/staking/storage"

export const investmentService = new InvestmentService(
  ARGENT_TOKENS_DEFI_INVESTMENTS_URL,
  httpService,
  argentDb,
  stakingStore,
)
