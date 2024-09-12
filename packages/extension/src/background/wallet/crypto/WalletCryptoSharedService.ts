import { WalletBackupService } from "../backup/WalletBackupService"

import {
  decryptKeystoreJson,
  encryptKeystoreJson,
  HDNodeWallet,
  Mnemonic,
} from "ethers"
import { defaultNetwork } from "../../../shared/network"
import { WalletRecoverySharedService } from "../recovery/WalletRecoverySharedService"
import { WalletSessionService } from "../session/WalletSessionService"
import type { WalletSession } from "../session/walletSession.model"
import { IWalletDeploymentService } from "../deployment/IWalletDeploymentService"
import { IObjectStore } from "../../../shared/storage/__new/interface"
import { walletToKeystore } from "../utils"

export class WalletCryptoSharedService {
  constructor(
    private readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly sessionService: WalletSessionService,
    private readonly backupService: WalletBackupService,
    private readonly recoverySharedService: WalletRecoverySharedService,
    private readonly deploymentChainService: IWalletDeploymentService,
    private SCRYPT_N: number,
  ) {}

  public async restoreSeedPhrase(seedPhrase: string, newPassword: string) {
    const ethersWallet = HDNodeWallet.fromPhrase(seedPhrase)
    const encryptedBackup = await encryptKeystoreJson(
      walletToKeystore(ethersWallet),
      newPassword,
      {
        scrypt: { N: this.SCRYPT_N },
      },
    )

    await this.backupService.importBackup(encryptedBackup)
    await this.sessionService.setSession(ethersWallet.privateKey, newPassword)
    const accounts = await this.recoverySharedService.discoverAccounts()

    const hasAccountsOnDefaultNetwork = accounts.some(
      (account) => account.networkId === defaultNetwork.id,
    )

    if (!hasAccountsOnDefaultNetwork) {
      void this.deploymentChainService.newAccount(defaultNetwork.id)
    }
  }

  public async getSeedPhrase(): Promise<string> {
    const session = await this.sessionStore.get()
    const backup = await this.backupService.getBackup()

    if (!(await this.sessionService.isSessionOpen()) || !session || !backup) {
      throw new Error("Session is not open")
    }

    const keystore = await decryptKeystoreJson(backup, session.password)

    if (!keystore.mnemonic?.entropy) {
      throw new Error("No entropy found in keystore")
    }

    const mnemonic = Mnemonic.fromEntropy(keystore.mnemonic.entropy)

    return mnemonic.phrase
  }
}
