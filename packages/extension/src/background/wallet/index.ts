import { Account, InvocationsDetails } from "starknet"

import { Address } from "@argent/x-shared"
import { ProgressCallback } from "ethers"
import { WalletAccountSharedService } from "../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { PendingMultisig } from "../../shared/multisig/types"
import { Network } from "../../shared/network"
import { BaseSignerInterface } from "../../shared/signer/BaseSignerInterface"
import {
  ArgentAccountType,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  CreateAccountType,
  ImportedLedgerAccount,
  MultisigData,
  NetworkOnlyPlaceholderAccount,
  SignerType,
  WalletAccount,
} from "../../shared/wallet.model"
import { WalletAccountStarknetService } from "./account/WalletAccountStarknetService"
import { WalletBackupService } from "./backup/WalletBackupService"
import { WalletCryptoSharedService } from "./crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "./crypto/WalletCryptoStarknetService"
import { WalletDeploymentStarknetService } from "./deployment/WalletDeploymentStarknetService"
import { WalletRecoverySharedService } from "./recovery/WalletRecoverySharedService"
import { WalletRecoveryStarknetService } from "./recovery/WalletRecoveryStarknetService"
import { WalletSessionService } from "./session/WalletSessionService"

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
  public async selectAccount(
    accountIdentifier?: BaseWalletAccount | NetworkOnlyPlaceholderAccount,
  ) {
    return this.walletAccountSharedService.selectAccount(accountIdentifier)
  }
  public async getMultisigAccount(selector: BaseWalletAccount) {
    return this.walletAccountSharedService.getMultisigAccount(selector)
  }
  public async getLastUsedOnNetwork(networkId: string) {
    return this.walletAccountSharedService.getLastUsedAccountOnNetwork(
      networkId,
    )
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
  public async newPendingMultisig(
    networkId: string,
    signerType: SignerType,
  ): Promise<PendingMultisig> {
    return this.walletAccountStarknetService.newPendingMultisig(
      networkId,
      signerType,
    )
  }
  public getStarknetAccountOfType(
    account: Account,
    signer: BaseSignerInterface,
    walletAccount: Pick<WalletAccount, "type" | "guardian">,
  ) {
    return this.walletAccountStarknetService.getStarknetAccountOfType(
      account,
      signer,
      walletAccount,
    )
  }

  public getLedgerAccounts(networkId: string, start: number, total: number) {
    return this.walletAccountStarknetService.getLedgerAccounts(
      networkId,
      start,
      total,
    )
  }

  public addLedgerAccounts(
    accounts: ImportedLedgerAccount[],
    networkId: string,
  ) {
    return this.walletAccountStarknetService.addLedgerAccounts(
      accounts,
      networkId,
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
  public async getArgentPubKeyByDerivationPath(derivationPath: string) {
    return this.walletCryptoStarknetService.getArgentPubKeyByDerivationPath(
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

  public async getNextPublicKey(
    accountType: CreateAccountType,
    signerType: SignerType,
    networkId: string,
  ) {
    return this.walletCryptoStarknetService.getNextPublicKey(
      accountType,
      signerType,
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
  public async getAccountDeploymentFee(
    walletAccount: WalletAccount,
    feeTokenAddress: Address,
  ) {
    return this.walletDeploymentStarknetService.getAccountDeploymentFee(
      walletAccount,
      feeTokenAddress,
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
  public async getAccountOrMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ) {
    return this.walletDeploymentStarknetService.getAccountOrMultisigDeploymentPayload(
      walletAccount,
    )
  }
  public async getDeployContractPayloadForAccountIndex(
    index: number,
    signerType: SignerType,
    networkId: string,
  ) {
    return this.walletDeploymentStarknetService.getDeployContractPayloadForAccountIndex(
      index,
      signerType,
      networkId,
    )
  }
  public async getDeployContractPayloadForMultisig(props: {
    threshold: number
    signers: string[]
    index: number
    networkId: string
    signerType: SignerType
  }) {
    return this.walletDeploymentStarknetService.getDeployContractPayloadForMultisig(
      props,
    )
  }
  public async newAccount(
    networkId: string,
    type: CreateAccountType = "standard",
    signerType?: SignerType,
    multisigPayload?: MultisigData,
  ) {
    return this.walletDeploymentStarknetService.newAccount(
      networkId,
      type,
      signerType,
      multisigPayload,
    )
  }

  // WalletRecoverySharedService
  public async discoverAccounts() {
    return this.walletRecoverySharedService.discoverAccounts()
  }

  public async restoreMultisigAccountsFromLedger(networkId: string) {
    return this.walletRecoverySharedService.restoreMultisigAccountsFromLedger(
      networkId,
    )
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
