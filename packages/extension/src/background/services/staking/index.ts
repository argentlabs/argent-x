import { httpService } from "../../../shared/http/singleton"
import { backgroundActionService } from "../action"
import { investmentService } from "../investments"
import { StakingService } from "./StakingService"

export const stakingService = new StakingService(
  investmentService,
  httpService,
  backgroundActionService,
)
