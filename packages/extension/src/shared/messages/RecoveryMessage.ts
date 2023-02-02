export type RecoveryMessage =
  | { type: "RECOVER_BACKUP"; data: string }
  | { type: "RECOVER_BACKUP_RES" }
  | { type: "RECOVER_BACKUP_REJ"; data: string }
  | { type: "RECOVER_SEEDPHRASE"; data: { secure: true; body: string } }
  | { type: "RECOVER_SEEDPHRASE_RES" }
  | { type: "RECOVER_SEEDPHRASE_REJ"; data: string }
  | { type: "DOWNLOAD_BACKUP_FILE" }
  | { type: "DOWNLOAD_BACKUP_FILE_RES" }
