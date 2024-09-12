import { messageClient } from "../trpc"

import { UdcService } from "./UdcService"

export const udcService = new UdcService(messageClient)
