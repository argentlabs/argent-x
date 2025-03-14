import type { Account, InvocationsDetails } from "starknet"

import type { Address } from "@argent/x-shared"
import type { ProgressCallback } from "ethers"
import type { WalletAccountSharedService } from "../../shared/account/service/accountSharedService/WalletAccountSharedService"
import type { PendingMultisig } from "../../shared/multisig/types"
import type { Network } from "../../shared/network"
import type { BaseSignerInterface } from "../../shared/signer/BaseSignerInterface"
import type {
  AccountId,
  ArgentAccountType,
  ArgentWalletAccount,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  CreateAccountType,
  ImportedLedgerAccount,
  MultisigData,
  NetworkOnlyPlaceholderAccount,
  SignerType,
  WalletAccount,
} from "../../shared/wallet.model"
import type { WalletAccountStarknetService } from "./account/WalletAccountStarknetService"
import type { WalletBackupService } from "./backup/WalletBackupService"
import type { WalletCryptoSharedService } from "./crypto/WalletCryptoSharedService"
import type { WalletCryptoStarknetService } from "./crypto/WalletCryptoStarknetService"
import type { WalletDeploymentStarknetService } from "./deployment/WalletDeploymentStarknetService"
import type { WalletRecoverySharedService } from "./recovery/WalletRecoverySharedService"
import type { WalletRecoveryStarknetService } from "./recovery/WalletRecoveryStarknetService"
import type { WalletSessionService } from "./session/WalletSessionService"
import type { ValidatedImport } from "../../shared/accountImport/types"

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
  public async getAccount(accountId: AccountId): Promise<WalletAccount | null> {
    return this.walletAccountSharedService.getAccount(accountId)
  }
  public async getArgentAccount(
    accountId: AccountId,
  ): Promise<ArgentWalletAccount | null> {
    return this.walletAccountSharedService.getArgentAccount(accountId)
  }
  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    return this.walletAccountSharedService.getSelectedAccount()
  }
  public async selectAccount(
    accountIdentifier?: AccountId | NetworkOnlyPlaceholderAccount,
  ) {
    return this.walletAccountSharedService.selectAccount(accountIdentifier)
  }
  public async getMultisigAccount(accountId: AccountId) {
    return this.walletAccountSharedService.getMultisigAccount(accountId)
  }
  public async getLastUsedOnNetwork(networkId: string) {
    return this.walletAccountSharedService.getLastUsedAccountOnNetwork(
      networkId,
    )
  }

  // WalletAccountStarknetService
  public async getStarknetAccount(accountId: AccountId, useLatest = false) {
    return this.walletAccountStarknetService.getStarknetAccount(
      accountId,
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

  public importAccount(account: ValidatedImport) {
    return this.walletAccountStarknetService.importAccount(account)
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
  public async getPrivateKey(accountId: AccountId): Promise<string> {
    return this.walletCryptoStarknetService.getPrivateKey(accountId)
  }
  public async getPublicKey(accountId?: AccountId) {
    return this.walletCryptoStarknetService.getPublicKey(accountId)
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

  public async getAccountSigners() {
    return this.walletCryptoStarknetService.getAccountSigners()
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
    walletAccount: ArgentWalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ) {
    return this.walletDeploymentStarknetService.deployAccount(
      walletAccount,
      transactionDetails,
    )
  }

  public async getDeployAccountTransactionHash(
    walletAccount: ArgentWalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ) {
    return this.walletDeploymentStarknetService.getDeployAccountTransactionHash(
      walletAccount,
      transactionDetails,
    )
  }

  public async getAccountDeploymentFee(
    walletAccount: ArgentWalletAccount,
    feeTokenAddress: Address,
  ) {
    return this.walletDeploymentStarknetService.getAccountDeploymentFee(
      walletAccount,
      feeTokenAddress,
    )
  }
  public async getAccountDeploymentPayload(walletAccount: ArgentWalletAccount) {
    return this.walletDeploymentStarknetService.getAccountDeploymentPayload(
      walletAccount,
    )
  }
  public async getMultisigDeploymentPayload(
    walletAccount: ArgentWalletAccount,
  ) {
    return this.walletDeploymentStarknetService.getMultisigDeploymentPayload(
      walletAccount,
    )
  }
  public async getAccountOrMultisigDeploymentPayload(
    walletAccount: ArgentWalletAccount,
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
    networkId: string
    publicKey: string
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
