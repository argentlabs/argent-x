import { KeyValueStorage } from "../../storage"
import { INFTWorkerStore } from "./interface"

export const nftWorkerStore = new KeyValueStorage<INFTWorkerStore>(
  {},
  {
    namespace: "core:nft:worker",
  },
)
