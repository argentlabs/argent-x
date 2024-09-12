import { messageClient } from "../trpc"
import { ClientOnboardingService } from "./ClientOnboardingService"

export const onboardingService = new ClientOnboardingService(messageClient)
