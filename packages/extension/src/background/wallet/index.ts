import { Account, InvocationsDetails } from "starknet"
import { Account as Account4__deprecated } from "starknet4-deprecated"

import {
  ArgentAccountType,
  BaseMultisigWalletAccount,
  CreateAccountType,
  MultisigData,
} from "../../shared/wallet.model"
import { PendingMultisig } from "../../shared/multisig/types"
import { Network } from "../../shared/network"
import { BaseWalletAccount, WalletAccount } from "../../shared/wallet.model"
import { WalletAccountSharedService } from "./account/shared.service"
import { WalletAccountStarknetService } from "./account/starknet.service"
import { WalletBackupService } from "./backup/backup.service"
import { WalletCryptoSharedService } from "./crypto/shared.service"
import { WalletCryptoStarknetService } from "./crypto/starknet.service"
import { WalletDeploymentStarknetService } from "./deployment/starknet.service"
import { WalletRecoverySharedService } from "./recovery/shared.service"
import { WalletSessionService } from "./session/session.service"
import { WalletRecoveryStarknetService } from "./recovery/starknet.service"
import { ProgressCallback } from "ethers/lib/utils"

export class Wallet {
  constructor(
    private readonly walletAccountSharedService: WalletAccountSharedService,
    private readonly walletAccountStarknetService: WalletAccountStarknetService,
    private readonly walletBackupService: WalletBackupService,
    private readonly walletCryptoSharedService: WalletCryptoSharedService,
    private readonly walletCryptoStarknetService: WalletCryptoStarknetService,
    private readonly walletDeploymentStarknetService: WalletDeploymentStarknetService,
    private readonly walletRecoverySharedService: WalletRecoverySharedService,
    private readonly walletRecoveryStarknetService: WalletRecoveryStarknetService,
    private readonly walletSessionService: WalletSessionService,
  ) {}

  // WalletAccountSharedService
  public async getDefaultAccountName(
    networkId: string,
    type: CreateAccountType,
  ) {
    return this.walletAccountSharedService.getDefaultAccountName(
      networkId,
      type,
    )
  }
  public async getAccount(
    selector: BaseWalletAccount,
  ): Promise<WalletAccount | null> {
    return this.walletAccountSharedService.getAccount(selector)
  }
  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    return this.walletAccountSharedService.getSelectedAccount()
  }
  public async selectAccount(accountIdentifier?: BaseWalletAccount | null) {
    return this.walletAccountSharedService.selectAccount(accountIdentifier)
  }
  public async getMultisigAccount(selector: BaseWalletAccount) {
    return this.walletAccountSharedService.getMultisigAccount(selector)
  }

  // WalletAccountStarknetService
  public async getStarknetAccount(
    selector: BaseWalletAccount,
    useLatest = false,
  ) {
    return this.walletAccountStarknetService.getStarknetAccount(
      selector,
      useLatest,
    )
  }
  public async getSelectedStarknetAccount() {
    return this.walletAccountStarknetService.getSelectedStarknetAccount()
  }
  public async newPendingMultisig(networkId: string): Promise<PendingMultisig> {
    return this.walletAccountStarknetService.newPendingMultisig(networkId)
  }
  public getStarknetAccountOfType(
    account: Account | Account4__deprecated,
    type: ArgentAccountType,
  ) {
    return this.walletAccountStarknetService.getStarknetAccountOfType(
      account,
      type,
    )
  }

  // WalletBackupService
  public async getBackup() {
    return this.walletBackupService.getBackup()
  }
  public async isInitialized() {
    return this.walletBackupService.isInitialized()
  }
  public async importBackup(backup: string) {
    return this.walletBackupService.importBackup(backup)
  }

  // WalletCryptoSharedService
  public async restoreSeedPhrase(seedPhrase: string, newPassword: string) {
    return this.walletCryptoSharedService.restoreSeedPhrase(
      seedPhrase,
      newPassword,
    )
  }
  public async getSeedPhrase(): Promise<string> {
    return this.walletCryptoSharedService.getSeedPhrase()
  }

  // WalletCryptoStarknetService
  public async getKeyPairByDerivationPath(derivationPath: string) {
    return this.walletCryptoStarknetService.getKeyPairByDerivationPath(
      derivationPath,
    )
  }
  public async getSignerForAccount(account: WalletAccount) {
    return this.walletCryptoStarknetService.getSignerForAccount(account)
  }
  public async getPrivateKey(
    baseWalletAccount: BaseWalletAccount,
  ): Promise<string> {
    return this.walletCryptoStarknetService.getPrivateKey(baseWalletAccount)
  }
  public async getPublicKey(baseAccount?: BaseWalletAccount) {
    return this.walletCryptoStarknetService.getPublicKey(baseAccount)
  }
  public async getNextPublicKeyForMultisig(networkId: string) {
    return this.walletCryptoStarknetService.getNextPublicKeyForMultisig(
      networkId,
    )
  }
  public async getPublicKeysBufferForMultisig(start: number, buffer: number) {
    return this.walletCryptoStarknetService.getPublicKeysBufferForMultisig(
      start,
      buffer,
    )
  }
  public async getUndeployedAccountCairoVersion(
    baseAccount: BaseWalletAccount,
  ) {
    return this.walletCryptoStarknetService.getUndeployedAccountCairoVersion(
      baseAccount,
    )
  }

  public async getCalculatedMultisigAddress(
    baseMultisigAccount: BaseMultisigWalletAccount,
  ) {
    return this.walletCryptoStarknetService.getCalculatedMultisigAddress(
      baseMultisigAccount,
    )
  }
  async getAccountClassHashForNetwork(
    network: Network,
    accountType: ArgentAccountType,
  ): Promise<string> {
    return this.walletCryptoStarknetService.getAccountClassHashForNetwork(
      network,
      accountType,
    )
  }

  // WalletDeploymentStarknetService
  public async deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ) {
    return this.walletDeploymentStarknetService.deployAccount(
      walletAccount,
      transactionDetails,
    )
  }
  public async getAccountDeploymentFee(walletAccount: WalletAccount) {
    return this.walletDeploymentStarknetService.getAccountDeploymentFee(
      walletAccount,
    )
  }
  public async redeployAccount(account: WalletAccount) {
    return this.walletDeploymentStarknetService.redeployAccount(account)
  }
  public async getAccountDeploymentPayload(walletAccount: WalletAccount) {
    return this.walletDeploymentStarknetService.getAccountDeploymentPayload(
      walletAccount,
    )
  }
  public async getMultisigDeploymentPayload(walletAccount: WalletAccount) {
    return this.walletDeploymentStarknetService.getMultisigDeploymentPayload(
      walletAccount,
    )
  }
  public async getDeployContractPayloadForAccountIndex(
    index: number,
    networkId: string,
  ) {
    return this.walletDeploymentStarknetService.getDeployContractPayloadForAccountIndex(
      index,
      networkId,
    )
  }
  public async getDeployContractPayloadForMultisig(props: {
    threshold: number
    signers: string[]
    index: number
    networkId: string
  }) {
    return this.walletDeploymentStarknetService.getDeployContractPayloadForMultisig(
      props,
    )
  }
  public async newAccount(
    networkId: string,
    type: CreateAccountType = "standard",
    multisigPayload?: MultisigData,
  ) {
    return this.walletDeploymentStarknetService.newAccount(
      networkId,
      type,
      multisigPayload,
    )
  }

  // WalletRecoverySharedService
  public async discoverAccounts() {
    return this.walletRecoverySharedService.discoverAccounts()
  }

  // WalletSessionService
  public async isSessionOpen() {
    return this.walletSessionService.isSessionOpen()
  }
  public async startSession(
    password: string,
    progressCallback?: ProgressCallback,
  ) {
    return this.walletSessionService.startSession(password, progressCallback)
  }
  public async checkPassword(password: string): Promise<boolean> {
    return this.walletSessionService.checkPassword(password)
  }
  public async lock() {
    return this.walletSessionService.lock()
  }
  public async setSession(secret: string, password: string) {
    return this.walletSessionService.setSession(secret, password)
  }
}
