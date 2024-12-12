import { StakingService } from "./StakingService"
import { messageClient } from "../trpc"

export const stakingService = new StakingService(messageClient)
