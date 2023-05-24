import { allNetworksStore } from "../../../network/storage"
import { adaptArrayStorage } from "../repository"

export const networksRepository = adaptArrayStorage(allNetworksStore)
