import { httpService } from "../../../shared/http/singleton"
import { ReferralService } from "./ReferralService"

export const referralService = new ReferralService(httpService)
