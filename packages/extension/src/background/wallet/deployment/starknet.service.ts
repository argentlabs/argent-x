import {
  addressSchema,
  isContractDeployed,
  isEqualAddress,
} from "@argent/shared"
import {
  CallData,
  DeployAccountContractPayload,
  DeployAccountContractTransaction,
  EstimateFee,
  InvocationsDetails,
  hash,
} from "starknet"

import { withHiddenSelector } from "../../../shared/account/selectors"
import { PendingMultisig } from "../../../shared/multisig/types"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import { getProvider } from "../../../shared/network/provider"
import { INetworkService } from "../../../shared/network/service/interface"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import {
  BaseMultisigWalletAccount,
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  WalletAccount,
} from "../../../shared/wallet.model"

import { WalletAccountSharedService } from "../account/shared.service"

import {
  MULTISIG_DERIVATION_PATH,
  STANDARD_DERIVATION_PATH,
} from "../../../shared/wallet.service"
import {
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "../../keys/keyDerivation"
import { getNonce, increaseStoredNonce } from "../../nonce"
import { isAccountV5 } from "../../../shared/utils/accountv4"
import { WalletAccountStarknetService } from "../account/starknet.service"
import { WalletBackupService } from "../backup/backup.service"
import { WalletCryptoStarknetService } from "../crypto/starknet.service"
import { WalletSessionService } from "../session/session.service"
import type { WalletSession } from "../session/walletSession.model"
import { PROXY_CONTRACT_CLASS_HASHES } from "../starknet.constants"
import { IWalletDeploymentService } from "./interface"
import { SessionError } from "../../../shared/errors/session"
import { WalletError } from "../../../shared/errors/wallet"
import { STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH } from "../../../shared/network/constants"
import { AccountError } from "../../../shared/errors/account"

const { getSelectorFromName, calculateContractAddressFromHash } = hash

export class WalletDeploymentStarknetService
  implements IWalletDeploymentService
{
  constructor(
    private readonly walletStore: IRepository<WalletAccount>,
    private readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly sessionService: WalletSessionService,
    public readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly accountStarknetService: WalletAccountStarknetService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly backupService: WalletBackupService,
    private readonly networkService: Pick<INetworkService, "getById">,
  ) {}

  public async deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount)

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_DEPLOY_OLD_ACCOUNTS" })
    }

    let deployAccountPayload: DeployAccountContractPayload

    if (walletAccount.type === "multisig") {
      deployAccountPayload = await this.getMultisigDeploymentPayload(
        walletAccount,
      )
    } else {
      deployAccountPayload = await this.getAccountDeploymentPayload(
        walletAccount,
      )
    }

    if (!isAccountV5(starknetAccount)) {
      throw new AccountError({ code: "CANNOT_DEPLOY_OLD_ACCOUNTS" })
    }

    const { transaction_hash } = await starknetAccount.deployAccount(
      deployAccountPayload,
      transactionDetails,
    )

    await this.accountSharedService.selectAccount(walletAccount)

    return { account: walletAccount, txHash: transaction_hash }
  }

  public async getAccountDeploymentFee(
    walletAccount: WalletAccount,
  ): Promise<EstimateFee> {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount)

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_ESTIMATE_DEPLOY_OLD_ACCOUNTS" })
    }

    const deployAccountPayload =
      walletAccount.type === "multisig"
        ? await this.getMultisigDeploymentPayload(walletAccount)
        : await this.getAccountDeploymentPayload(walletAccount)
    if (!isAccountV5(starknetAccount)) {
      throw new AccountError({
        code: "CANNOT_ESTIMATE_FEE_OLD_ACCOUNTS_DEPLOYMENT",
      })
    }
    return starknetAccount.estimateAccountDeployFee(deployAccountPayload)
  }

  public async redeployAccount(account: WalletAccount) {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount({
        address: account.address,
        networkId: account.networkId,
      })
    const nonce = await getNonce(account, starknetAccount)

    const deployTransaction = await this.deployAccount(account, { nonce })

    await increaseStoredNonce(account)

    return { account, txHash: deployTransaction.txHash }
  }

  /** Get the Account Deployment Payload
   * Use it in the deployAccount and getAccountDeploymentFee methods
   * @param  {WalletAccount} walletAccount
   */
  public async getAccountDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const starkPair =
      await this.cryptoStarknetService.getKeyPairByDerivationPath(
        walletAccount.signer.derivationPath,
      )

    const starkPub = starkPair.pubKey

    // Try to get the account class hash from walletAccount if it exists
    // If it doesn't exist, get it from the network object
    const accountClassHash =
      walletAccount.classHash ??
      (await this.cryptoStarknetService.getAccountClassHashForNetwork(
        walletAccount.network,
        walletAccount.type,
      ))

    const constructorCallData = {
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: CallData.compile({ signer: starkPub, guardian: "0" }),
    }

    const deployAccountPayloadCairo0 = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      contractAddress: walletAccount.address,
      constructorCalldata: CallData.compile(constructorCallData),
      addressSalt: starkPub,
    }

    const deployAccountPayloadCairo1 = {
      classHash: accountClassHash,
      contractAddress: walletAccount.address,
      constructorCalldata: CallData.compile({
        signer: starkPub,
        guardian: "0",
      }),
      addressSalt: starkPub,
    }

    let deployAccountPayload

    if (walletAccount.type === "standardCairo0") {
      deployAccountPayload = deployAccountPayloadCairo0
    } else {
      deployAccountPayload = deployAccountPayloadCairo1
    }

    const calculatedAccountAddress = calculateContractAddressFromHash(
      deployAccountPayload.addressSalt,
      deployAccountPayload.classHash,
      deployAccountPayload.constructorCalldata,
      0,
    )

    if (isEqualAddress(walletAccount.address, calculatedAccountAddress)) {
      return deployAccountPayload
    }

    // Warn if the account was created using Cairo 0 implementation and the address does not match
    console.warn(
      "Calculated address does not match Cairo 1 account address. Trying Cairo 0 implementation",
    )

    const cairo0Calldata = CallData.compile({
      ...constructorCallData,
      implementation: STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH, // last Cairo 0 implementation
    })

    // Try to deploy using Cairo 0 implementation
    const cairo0CalculatedAccountAddress = calculateContractAddressFromHash(
      deployAccountPayloadCairo0.addressSalt,
      deployAccountPayloadCairo0.classHash,
      cairo0Calldata,
      0,
    )

    if (isEqualAddress(walletAccount.address, cairo0CalculatedAccountAddress)) {
      console.warn("Address matches Cairo 0 implementation")
      deployAccountPayloadCairo0.constructorCalldata = cairo0Calldata
      return deployAccountPayloadCairo0
    }

    console.warn(
      "Calculated address does not match Cairo 0 account address. Trying old implementation",
    )

    // In the end, try to deploy using the old implementation
    const oldCalldata = CallData.compile({
      ...constructorCallData,
      implementation:
        "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f", // old implementation, ask @janek why
    })

    const oldCalculatedAddress = calculateContractAddressFromHash(
      deployAccountPayload.addressSalt,
      deployAccountPayload.classHash,
      oldCalldata,
      0,
    )

    if (isEqualAddress(oldCalculatedAddress, walletAccount.address)) {
      console.warn("Address matches old implementation")
      deployAccountPayload.constructorCalldata = oldCalldata
    } else {
      throw new AccountError({ code: "CALCULATED_ADDRESS_NO_MATCH" })
    }

    return deployAccountPayload
  }

  public async getMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const multisigAccount = await getMultisigAccountFromBaseWallet(
      walletAccount,
    )

    if (!multisigAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const { address, network, signer, threshold, signers } = multisigAccount

    const starkPair =
      await this.cryptoStarknetService.getKeyPairByDerivationPath(
        signer.derivationPath,
      )

    const starkPub = starkPair.pubKey

    const accountClassHash =
      multisigAccount.classHash ??
      (await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "multisig", // make sure to always use the multisig implementation
      ))

    const deployMultisigPayload = {
      classHash: accountClassHash,
      contractAddress: address,
      constructorCalldata: CallData.compile({
        threshold, // Initial threshold
        signers, // Initial signers
      }),
      addressSalt: starkPub,
    }

    // Mostly we don't need to calculate the address,
    // but we do it here just to make sure the address is correct
    const calculatedMultisigAddress = calculateContractAddressFromHash(
      deployMultisigPayload.addressSalt,
      deployMultisigPayload.classHash,
      deployMultisigPayload.constructorCalldata,
      0,
    )

    if (!isEqualAddress(calculatedMultisigAddress, address)) {
      throw new AccountError({ code: "CALCULATED_ADDRESS_NO_MATCH" })
    }

    return deployMultisigPayload
  }

  // TODO: remove this once testing of cairo 1 is done
  public async getDeployContractPayloadForAccountIndexCairo0(
    index: number,
    networkId: string,
  ): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const { pubKey } = getStarkPair(
      index,
      session?.secret,
      STANDARD_DERIVATION_PATH,
    )

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standardCairo0",
      )

    const payload = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      constructorCalldata: CallData.compile({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: CallData.compile({ signer: pubKey, guardian: "0" }),
      }),
      addressSalt: pubKey,
    }

    return payload
  }

  public async getDeployContractPayloadForAccountIndex(
    index: number,
    networkId: string,
  ): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const { pubKey } = getStarkPair(
      index,
      session?.secret,
      STANDARD_DERIVATION_PATH,
    )

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standard",
      )

    const payload = {
      classHash: accountClassHash,
      constructorCalldata: CallData.compile({
        signer: pubKey,
        guardian: "0",
      }),
      addressSalt: pubKey,
    }

    return payload
  }

  public async getDeployContractPayloadForMultisig({
    signers,
    threshold,
    index,
    networkId,
  }: {
    threshold: number
    signers: string[]
    index: number
    networkId: string
  }): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const { pubKey } = getStarkPair(
      index,
      session?.secret,
      MULTISIG_DERIVATION_PATH,
    )

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "multisig",
      )

    const payload = {
      classHash: accountClassHash,
      constructorCalldata: CallData.compile({
        threshold, // Initial threshold
        signers, // Initial signers
      }),
      addressSalt: pubKey,
    }

    return payload
  }

  public async newAccount(
    networkId: string,
    type: CreateAccountType = "standard", // Should not be able to create plugin accounts. Default to argent account
    multisigPayload?: MultisigData,
  ): Promise<CreateWalletAccount> {
    const session = await this.sessionStore.get()
    if (!(await this.sessionService.isSessionOpen()) || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)

    const accounts = await this.walletStore.get(withHiddenSelector)

    const pendingMultisigs = await this.pendingMultisigStore.get()

    const accountsOrPendingMultisigs = [...accounts, ...pendingMultisigs]

    const baseDerivationPath =
      type === "multisig" ? MULTISIG_DERIVATION_PATH : STANDARD_DERIVATION_PATH

    const currentPaths = accountsOrPendingMultisigs
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.signer.derivationPath.startsWith(baseDerivationPath) && // filters out invalid account types
          account.networkId === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, baseDerivationPath)

    let payload: Omit<Required<DeployAccountContractTransaction>, "signature">

    if (type === "multisig" && multisigPayload) {
      payload = await this.getDeployContractPayloadForMultisig({
        index,
        networkId,
        ...multisigPayload,
      })
    } else if (type === "standardCairo0") {
      payload = await this.getDeployContractPayloadForAccountIndexCairo0(
        index,
        networkId,
      )
    } else {
      payload = await this.getDeployContractPayloadForAccountIndex(
        index,
        networkId,
      )
    }

    const accountAddress = calculateContractAddressFromHash(
      payload.addressSalt,
      payload.classHash,
      payload.constructorCalldata,
      0,
    )

    const defaultAccountName =
      type === "multisig" ? `Multisig ${index + 1}` : `Account ${index + 1}`

    const isDeployed = await isContractDeployed(
      getProvider(network),
      accountAddress,
    )

    const account: CreateWalletAccount = {
      name: defaultAccountName,
      network,
      networkId: network.id,
      address: accountAddress,
      signer: {
        type: "local_secret" as const,
        derivationPath: getPathForIndex(index, baseDerivationPath),
      },
      type,
      classHash: addressSchema.parse(payload.classHash), // This is only true for new Cairo 1 accounts. For Cairo 0, this is the proxy contract class hash
      cairoVersion: "1",
      needsDeploy: !isDeployed,
    }

    await this.walletStore.upsert([account])

    if (type === "multisig" && multisigPayload) {
      await this.multisigStore.upsert({
        address: account.address,
        networkId: account.networkId,
        signers: multisigPayload.signers,
        threshold: multisigPayload.threshold,
        creator: multisigPayload.creator,
        publicKey: multisigPayload.publicKey,
        updatedAt: Date.now(),
      })
    }

    await this.accountSharedService.selectAccount(account)

    return account
  }
}
