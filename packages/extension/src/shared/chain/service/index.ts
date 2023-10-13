import { networkService } from "../../network/service"
import { StarknetChainService } from "./implementation"

export const starknetChainService = new StarknetChainService(networkService)
