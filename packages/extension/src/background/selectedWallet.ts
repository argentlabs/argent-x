import { BackupWallet } from "../shared/backup.model"
import { Storage } from "./storage"

export const selectedWalletStore = new Storage<{
  SELECTED_WALLET: BackupWallet
}>({
  SELECTED_WALLET: {
    address: "",
    network: "",
    signer: { type: "", derivation_path: "" },
  },
})
