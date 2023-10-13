export interface IRecoveryService {
  byBackup: (backup: string) => Promise<void>
  bySeedPhrase: (seedPhrase: string, newPassword: string) => Promise<void>
}
