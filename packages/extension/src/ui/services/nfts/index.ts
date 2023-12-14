import { messageClient } from "../messaging/trpc"
import { ClientNftService } from "./implementation"
import { clientStarknetAddressService } from "../address"

export const clientNftService = new ClientNftService(
  messageClient,
  clientStarknetAddressService,
)
