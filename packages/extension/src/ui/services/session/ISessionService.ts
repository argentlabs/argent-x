import { WalletAccount } from "../../../shared/wallet.model"

export interface ISessionService {
  startSession: (password: string) => Promise<WalletAccount | undefined>
  stopSession: (initiatedByUI?: boolean) => Promise<void>
  checkPassword: (password: string) => Promise<boolean>
  getIsPasswordSet: () => Promise<boolean>
}
