import { messageClient } from "../trpc"
import { InvestmentService } from "./InvestmentService"

export const investmentService = new InvestmentService(messageClient)
