import type { WalletBackupService } from "../backup/WalletBackupService"

import {
  decryptKeystoreJson,
  encryptKeystoreJson,
  HDNodeWallet,
  Mnemonic,
} from "ethers"
import { defaultNetwork } from "../../../shared/network"
import type { WalletRecoverySharedService } from "../recovery/WalletRecoverySharedService"
import type { WalletSessionService } from "../session/WalletSessionService"
import type { IWalletDeploymentService } from "../deployment/IWalletDeploymentService"
import { walletToKeystore } from "../utils"
import type { ISecretStorageService } from "../session/interface"

export class WalletCryptoSharedService {
  constructor(
    private readonly secretStorageService: ISecretStorageService,
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
    const decrypted = await this.secretStorageService.decrypt()
    const backup = await this.backupService.getBackup()

    if (!(await this.sessionService.isSessionOpen()) || !backup || !decrypted) {
      throw new Error("Session is not open")
    }

    const { password } = decrypted
    const keystore = await decryptKeystoreJson(backup, password)

    if (!keystore.mnemonic?.entropy) {
      throw new Error("No entropy found in keystore")
    }

    const mnemonic = Mnemonic.fromEntropy(keystore.mnemonic.entropy)

    return mnemonic.phrase
  }
}
