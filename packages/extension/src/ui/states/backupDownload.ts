import create from "zustand"
import { persist } from "zustand/middleware"

export interface BackupState {
  isBackupDownloadRequired: boolean
}

export const useBackupDownload = create<BackupState>(
  persist(
    (_set, _get) => ({
      isBackupDownloadRequired: false,
    }),
    { name: "backupDownload" },
  ),
)
