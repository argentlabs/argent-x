import create from "zustand"
import { persist } from "zustand/middleware"

export interface BackupState {
  isBackupDownloadRequired: boolean
  dontRemindUser: boolean
}

export const useBackupDownload = create<BackupState>(
  persist(
    (_set, _get) => ({
      isBackupDownloadRequired: false,
      dontRemindUser: false,
    }),
    { name: "backupDownload" },
  ),
)
