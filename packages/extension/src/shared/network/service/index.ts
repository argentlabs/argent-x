import { networkRepo } from "../store"
import { NetworkService } from "./implementation"

export const networkService = new NetworkService(networkRepo)
