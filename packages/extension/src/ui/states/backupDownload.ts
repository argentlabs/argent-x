import create from "zustand"
import { persist } from "zustand/middleware"

interface State {
  isBackupDownloadRequired: boolean
}

export const useBackupDownload = create<State>(
  persist(
    (_set, _get) => ({
      isBackupDownloadRequired: false,
    }),
    { name: "backupDownload" },
  ),
)
