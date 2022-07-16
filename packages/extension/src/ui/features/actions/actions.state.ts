import { globalActionQueueStore } from "../../../shared/actionQueue/store"
import { useArrayStorage } from "../../../shared/storage/hooks"

export const useActions = () => useArrayStorage(globalActionQueueStore)
