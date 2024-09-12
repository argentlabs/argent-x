import { networkRepo } from "../store"
import { NetworkService } from "./NetworkService"

export const networkService = new NetworkService(networkRepo)
