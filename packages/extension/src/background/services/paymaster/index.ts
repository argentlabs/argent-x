import { ARGENT_RELAYER_URL } from "../../../shared/api/constants"
import { httpService } from "../../../shared/http/singleton"
import { PaymasterService } from "@argent/x-shared/paymaster"

export const paymasterService = new PaymasterService(
  ARGENT_RELAYER_URL,
  httpService,
)
