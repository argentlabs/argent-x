import { messageClient } from "../messaging/trpc"
import { ClientStarknetAddressService } from "./client"

export const clientStarknetAddressService = new ClientStarknetAddressService(
  messageClient,
)
