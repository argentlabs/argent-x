import { StarknetAddressService } from "@argent/shared"
import { ARGENT_API_BASE_URL } from "../../../../shared/api/constants"
import { httpService } from "../http/singleton"
import { getDefaultNetworkId } from "../../../../shared/network/utils"

const allowedArgentNameNetworkId = getDefaultNetworkId()

export const backgroundStarknetAddressService = new StarknetAddressService(
  httpService,
  ARGENT_API_BASE_URL,
  allowedArgentNameNetworkId,
)
