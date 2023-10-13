import { messageClient } from "../messaging/trpc"

import { UdcService } from "./implementation"

export const udcService = new UdcService(messageClient)
