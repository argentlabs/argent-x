import { messageClient } from "../trpc"
import { ClientStarknetAddressService } from "./ClientStarknetAddressService"

export const clientStarknetAddressService = new ClientStarknetAddressService(
  messageClient,
)
