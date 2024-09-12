import { networkService } from "../../network/service"
import { StarknetChainService } from "./StarknetChainService"

export const starknetChainService = new StarknetChainService(networkService)
