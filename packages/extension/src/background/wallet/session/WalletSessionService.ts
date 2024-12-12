import type Emittery from "emittery"
import type { ProgressCallback } from "ethers"
import { Wallet, decryptKeystoreJson, encryptKeystoreJson } from "ethers"
import { noop, throttle } from "lodash-es"

import { SessionError } from "../../../shared/errors/session"
import type { IObjectStore } from "../../../shared/storage/__new/interface"
import type {
  WalletBackupService,
  WalletStorageProps,
} from "../backup/WalletBackupService"
import type { WalletRecoverySharedService } from "../recovery/WalletRecoverySharedService"
import { walletToKeystore } from "../utils"
import type { Events } from "./interface"
import { Locked } from "./interface"

export interface WalletSession {
  secret: string
  password: string
}

export class WalletSessionService {
  private _locked = true
  private isInitialising = true

  constructor(
    readonly emitter: Emittery<Events>,
    readonly store: IObjectStore<WalletStorageProps>,
    readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly backupService: WalletBackupService,
    private readonly recoverySharedService: WalletRecoverySharedService,
    private SCRYPT_N: number,
  ) {
    void (async () => {
      /** initialise locked state */
      const open = await this.isSessionOpen()
      this.locked = !open
    })()
  }

  public async isSessionOpen(): Promise<boolean> {
    return (await this.sessionStore.get()) !== null
  }

  public async startSession(
    password: string,
    progressCallback?: ProgressCallback,
  ): Promise<boolean> {
    // session has already started
    const session = await this.sessionStore.get()
    if (session) {
      return true
    }

    const throttledProgressCallback = throttle(progressCallback ?? noop, 50, {
      leading: true,
      trailing: true,
    })

    // wallet is not initialized: let's initialise it
    if (!(await this.backupService.isInitialized())) {
      await this.generateNewLocalSecret(password, throttledProgressCallback)
      return true
    }

    const backup = (await this.store.get()).backup

    if (!backup) {
      throw new SessionError({ code: "NO_BACKUP_FOUND" })
    }

    try {
      const wallet = await decryptKeystoreJson(
        backup,
        password,
        throttledProgressCallback,
      )

      await this.setSession(wallet.privateKey, password)

      // if we have not yet discovered accounts, do it now. This only applies to wallets which got restored from a backup file, as we could not restore all accounts from onchain yet as the backup was locked until now.
      const discoveredOnce = (await this.store.get()).discoveredOnce
      if (!discoveredOnce) {
        await this.recoverySharedService.discoverAccounts()
      }

      return true
    } catch {
      this.locked = true
      return false
    }
  }

  private async generateNewLocalSecret(
    password: string,
    progressCallback?: ProgressCallback,
  ) {
    if (await this.backupService.isInitialized()) {
      return
    }

    const ethersWallet = Wallet.createRandom()
    const keystore = walletToKeystore(ethersWallet)
    const encryptedBackup = await encryptKeystoreJson(keystore, password, {
      scrypt: { N: this.SCRYPT_N },
      progressCallback,
    })

    await this.store.set({ discoveredOnce: true })
    await this.store.set({ backup: encryptedBackup })
    return this.setSession(ethersWallet.privateKey, password)
  }

  public async checkPassword(password: string): Promise<boolean> {
    const session = await this.sessionStore.get()
    return session?.password === password
  }

  public async lock() {
    await this.sessionStore.set(null)
    this.locked = true
  }

  async setSession(secret: string, password: string) {
    await this.sessionStore.set({ secret, password })
    this.locked = false
  }

  get locked() {
    return this._locked
  }

  private set locked(locked: boolean) {
    if (this.isInitialising) {
      /** don't emit on initial value change */
      this.isInitialising = false
      this._locked = locked
      return
    }
    if (this._locked === locked) {
      return
    }
    this._locked = locked
    void this.emitter.emit(Locked, this.locked)
  }
}
