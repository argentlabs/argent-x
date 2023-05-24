import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface BackupState {
  isBackupRequired: boolean
}

export const useBackupRequired = create<BackupState>()(
  persist(
    (_set, _get) => ({
      isBackupRequired: true,
    }),
    { name: "backupDownload" },
  ),
)
