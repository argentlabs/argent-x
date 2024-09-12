import { messageClient } from "../trpc"
import { ClientNftService } from "./ClientNftService"
import { clientStarknetAddressService } from "../address"

export const clientNftService = new ClientNftService(
  messageClient,
  clientStarknetAddressService,
)
