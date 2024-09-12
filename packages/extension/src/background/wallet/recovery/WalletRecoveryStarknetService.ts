import { isEmpty, partition, union } from "lodash-es"
import { RpcProvider, num } from "starknet"
import { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"

import {
  getAccountCairoVersionFromChain,
  getAccountClassHashFromChain,
  getAccountDeployStatusFromChain,
  getAccountEscapeFromChain,
  getAccountGuardiansFromChain,
} from "../../../shared/account/details"
import {
  DetailFetchers,
  getAndMergeAccountDetails,
} from "../../../shared/account/details/getAndMergeAccountDetails"
import { Network, getProvider } from "../../../shared/network"
import {
  BaseMultisigWalletAccount,
  RecoveredLedgerMultisig,
  SignerType,
  WalletAccount,
} from "../../../shared/wallet.model"

import {
  Address,
  addressSchema,
  ensureArray,
  isContractDeployed,
  isEqualAddress,
  getArgentAccountClassHashes,
  findImplementationForAccount,
} from "@argent/x-shared"
import { z } from "zod"
import {
  ARGENT_API_ENABLED,
  ARGENT_SMART_ACCOUNT_DISCOVERY_URL,
} from "../../../shared/api/constants"
import {
  argentApiNetworkForNetwork,
  argentXHeaders,
} from "../../../shared/api/headers"
import { RecoveryError } from "../../../shared/errors/recovery"
import { ILedgerSharedService } from "../../../shared/ledger/service/ILedgerSharedService"
import { ApiMultisigDataForSigner } from "../../../shared/multisig/multisig.model"
import { IMultisigBackendService } from "../../../shared/multisig/service/backend/IMultisigBackendService"
import { getDefaultNetworkId } from "../../../shared/network/utils"
import { ArgentSigner } from "../../../shared/signer"
import { PublicKeyWithIndex } from "../../../shared/signer/types"
import { getBaseDerivationPath } from "../../../shared/signer/utils"
import { getStandardAccountDiscoveryUrl } from "../../../shared/utils/getStandardAccountDiscoveryUrl"
import {
  getCairo0AccountContractAddress,
  getCairo1AccountContractAddress,
} from "../../../shared/utils/getContractAddress"
import {
  sortAccountsByDerivationPath,
  sortMultisigByDerivationPath,
} from "../../../shared/utils/accountsMultisigSort"
import { IRepository } from "../../../shared/storage/__new/interface"
import { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import { IWalletRecoveryService } from "./IWalletRecoveryService"

const INITIAL_PUB_KEY_COUNT = 20

interface TempAccountData {
  account: WalletAccount
  pubKeyWithIndex: PublicKeyWithIndex
}

interface DiscoverySmartAccount {
  account: string
  ownerAddress: string
  guardianAddresses?: string[]
  salt?: string
  deployed?: boolean
  classHash: Address
}

export class WalletRecoveryStarknetService implements IWalletRecoveryService {
  constructor(
    private readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    private readonly multisigBackendService: IMultisigBackendService,
    private readonly ledgerSharedService: ILedgerSharedService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly walletAccountSharedService: WalletAccountSharedService,
  ) {}

  public async restoreAccountsFromWallet(
    secret: string,
    network: Network,
    initialPubKeyCount: number = INITIAL_PUB_KEY_COUNT,
  ): Promise<WalletAccount[]> {
    const accounts: WalletAccount[] = []

    let pubKeyCount = initialPubKeyCount
    let lastCheck = 0

    while (pubKeyCount > 0) {
      const [standardAccountPubKeys, multisigAccountPubKeys] = [
        getBaseDerivationPath("standard", SignerType.LOCAL_SECRET),
        getBaseDerivationPath("multisig", SignerType.LOCAL_SECRET),
      ].map((derivationPath) =>
        // Only local secret signers can be generated here
        ArgentSigner.generatePublicKeys(
          secret,
          lastCheck,
          initialPubKeyCount,
          derivationPath,
        ),
      )

      const tempAccountsData = await this.buildTempAccounts(
        standardAccountPubKeys,
        network,
      )

      const smartAccountsData = await this.buildSmartAccounts(
        network,
        standardAccountPubKeys,
      )

      const tempAccounts = tempAccountsData.map(({ account }) => account)
      const smartAccounts = smartAccountsData.map(({ account }) => account)

      const [validAccounts, validMultisigs, validSmartAccounts] =
        await Promise.all([
          this.fetchValidAccounts(tempAccounts, network),
          this.fetchValidMultisigAccounts(multisigAccountPubKeys, network),
          this.fetchValidSmartAccounts(smartAccounts, network),
        ])
      accounts.push(...validAccounts, ...validMultisigs, ...validSmartAccounts)

      lastCheck += initialPubKeyCount

      pubKeyCount =
        validAccounts.length + validMultisigs.length + validSmartAccounts.length
    }

    return await this.getAccountDetails(accounts)
  }

  public async restoreMultisigAccountsFromLedger(
    network: Network,
    initialPubKeyCount = INITIAL_PUB_KEY_COUNT,
  ): Promise<RecoveredLedgerMultisig[]> {
    const accounts: WalletAccount[] = []
    let pubKeyCount = initialPubKeyCount
    let lastCheck = 0

    while (pubKeyCount > 0) {
      const pubKeys = await this.ledgerSharedService.generatePublicKeys(
        "multisig",
        lastCheck,
        pubKeyCount,
      )
      const validMultisigs = await this.fetchValidMultisigAccounts(
        pubKeys,
        network,
        SignerType.LEDGER,
      )

      accounts.push(...validMultisigs)
      lastCheck += pubKeyCount
      pubKeyCount = validMultisigs.length
    }

    const multisigAccountsData = await this.multisigStore.get()

    const multisigAccounts = accounts
      .map((account) => {
        const multisigData = multisigAccountsData.find((m) =>
          isEqualAddress(m.address, account.address),
        )
        return multisigData ? { account, pubKey: multisigData.publicKey } : null
      })
      .filter((account): account is RecoveredLedgerMultisig => account !== null)

    return multisigAccounts
  }

  private getSmartAccountDiscoveryUrl(network: Network) {
    const defaultNetworkId = getDefaultNetworkId()
    const isSmartAccountEnabled =
      defaultNetworkId === network.id && ARGENT_API_ENABLED
    if (!isSmartAccountEnabled) {
      return
    }

    const backendNetwork = argentApiNetworkForNetwork(network.id)

    if (
      process.env.NODE_ENV !== "production" && // be more strict in development
      !ARGENT_SMART_ACCOUNT_DISCOVERY_URL
    ) {
      throw new RecoveryError({
        code: "ARGENT_SMART_ACCOUNT_DISCOVERY_URL_NOT_SET",
      })
    }

    if (!backendNetwork || !ARGENT_SMART_ACCOUNT_DISCOVERY_URL) {
      return
    }

    return ARGENT_SMART_ACCOUNT_DISCOVERY_URL
  }

  private async buildTempAccounts(
    pubKeysWithIndices: PublicKeyWithIndex[],
    network: Network,
  ): Promise<TempAccountData[]> {
    const standardAccountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standard",
      )

    const tempAccounts = pubKeysWithIndices.flatMap((pubKeyWithIndex) => {
      const cairo1Accounts = this.buildCairo1Accounts(
        network,
        pubKeyWithIndex,
        standardAccountClassHash,
      )
      const cairo0Accounts = this.buildCairo0Accounts(network, pubKeyWithIndex)

      return [...cairo1Accounts, ...cairo0Accounts]
    })

    return tempAccounts
  }

  private buildCairo1Accounts(
    network: Network,
    pubKeyWithIndex: PublicKeyWithIndex,
    defaultClassHash?: string,
  ) {
    // Discover Cairo1 standard accounts
    const cairo1AccountClassHashes = union(
      getArgentAccountClassHashes("cairo1"),
      [...(defaultClassHash ? [defaultClassHash] : [])],
    )

    return cairo1AccountClassHashes.map((accountClassHash) => {
      const address = getCairo1AccountContractAddress(
        accountClassHash,
        pubKeyWithIndex.pubKey,
      )

      const account = this.walletAccountSharedService.getDefaultStandardAccount(
        {
          index: pubKeyWithIndex.index,
          address,
          network,
          needsDeploy: false,
          name: `Account ${pubKeyWithIndex.index + 1}`,
          classHash: accountClassHash as Address,
        },
      )

      return {
        account,
        pubKeyWithIndex,
      }
    })
  }

  private async buildSmartAccounts(
    network: Network,
    pubKeysWithIndices: PublicKeyWithIndex[],
  ): Promise<TempAccountData[]> {
    return pubKeysWithIndices.flatMap((pubKeyWithIndex) => {
      const account = {
        ...this.walletAccountSharedService.getDefaultSmartAccount({
          index: pubKeyWithIndex.index,
          network,
          needsDeploy: false,
          name: `Account ${pubKeyWithIndex.index + 1}`,
          address: "",
        }),
        owner: pubKeyWithIndex.pubKey,
      }

      return {
        account,
        pubKeyWithIndex,
      }
    })
  }

  private buildCairo0Accounts(
    network: Network,
    pubKeyWithIndex: PublicKeyWithIndex,
    defaultClassHash?: string,
  ) {
    // Discover Cairo0 standard accounts
    const cairo0AccountClassHashes = union(
      getArgentAccountClassHashes("cairo0"),
      [...(defaultClassHash ? [defaultClassHash] : [])],
    )

    return cairo0AccountClassHashes.map((accountClassHash) => {
      const address = getCairo0AccountContractAddress(
        accountClassHash,
        pubKeyWithIndex.pubKey,
      )

      const account = this.walletAccountSharedService.getDefaultStandardAccount(
        {
          index: pubKeyWithIndex.index,
          address,
          network,
          needsDeploy: false,
          name: `Account ${pubKeyWithIndex.index + 1}`,
          classHash: accountClassHash as Address,
        },
      )

      return {
        account,
        pubKeyWithIndex,
      }
    })
  }

  private async fetchValidAccounts(
    tempAccounts: WalletAccount[],
    network: Network,
  ) {
    const tempAddresses = tempAccounts.map((account) =>
      addressSchema.parse(account.address),
    )

    const discoveryUrl = getStandardAccountDiscoveryUrl(network.id)

    const validAccountsResponse = discoveryUrl
      ? await this.fetchValidAccountsFromBackend(tempAddresses, discoveryUrl)
      : await this.fetchValidAccountsFromOnchain(tempAddresses, network)

    const validAccountAddresses = new Set(validAccountsResponse)

    return tempAccounts.filter((account) =>
      validAccountAddresses.has(addressSchema.parse(account.address)),
    )
  }

  private async isNetworkAvailable(provider: RpcProvider) {
    try {
      await provider.getSpecVersion()
      return true
    } catch (e) {
      return false
    }
  }

  private async fetchValidAccountsFromBackend(
    addresses: Address[],
    discoveryUrl: string,
  ): Promise<Address[]> {
    const response = await fetch(discoveryUrl, {
      method: "POST",
      body: JSON.stringify(addresses),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...argentXHeaders,
      },
    })

    if (!response.ok) {
      throw new RecoveryError({ code: "ACCOUNT_DISCOVERY_REQUEST_FAILED" })
    }

    const validAccountsResponse = await response.json()
    const validAccountAddresses = z
      .array(addressSchema)
      .parse(validAccountsResponse)

    return validAccountAddresses
  }

  /**
   * The response may also include standard accounts.
   * This is because certain accounts might have been originally set up as smart accounts but later converted to standard accounts.
   * When creating a smart account, the addresses is generated by the backend system.
   * Consequently, the standard discovery URL will not be able to retrieve them.
   */
  private async fetchSmartAccountsFromBackend(
    pubKeyAddresses: string[],
    discoveryUrl: string,
  ): Promise<DiscoverySmartAccount[]> {
    const response = await fetch(discoveryUrl, {
      method: "POST",
      body: JSON.stringify(pubKeyAddresses),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new RecoveryError({
        code: "SMART_ACCOUNT_DISCOVERY_REQUEST_FAILED",
      })
    }

    const validAccountsResponse: DiscoverySmartAccount[] = ensureArray(
      await response.json(),
    )

    return validAccountsResponse
  }

  private async fetchValidAccountsFromOnchain(
    addresses: Address[],
    network: Network,
  ): Promise<Address[]> {
    const provider = getProvider(network)
    const isNetworkAvailable = await this.isNetworkAvailable(provider)

    if (!isNetworkAvailable) {
      return []
    }

    const validAccountAddresses = await Promise.all(
      addresses.map(async (address) =>
        (await isContractDeployed(provider, address)) ? address : undefined,
      ),
    )

    return validAccountAddresses.filter(
      (address): address is Address => !!address,
    )
  }

  private async fetchValidMultisigAccounts(
    publicKeysWithIndices: PublicKeyWithIndex[],
    network: Network,
    signerType: SignerType = SignerType.LOCAL_SECRET,
  ) {
    let discoveredMultisigs

    try {
      discoveredMultisigs = await this.multisigBackendService.discoverMultisigs(
        network,
        publicKeysWithIndices.map(({ pubKey }) => pubKey),
      )
    } catch (error) {
      return []
    }

    const resolvedMultisigs = await this.resolveValidMultisigs(
      discoveredMultisigs,
      publicKeysWithIndices,
      network,
      signerType,
    )
    return resolvedMultisigs.filter((m): m is WalletAccount => !!m)
  }

  private async resolveValidMultisigs(
    validMultisigs: ApiMultisigDataForSigner,
    publicKeysWithIndices: PublicKeyWithIndex[],
    network: Network,
    signerType: SignerType,
  ) {
    const multisigToInsert: BaseMultisigWalletAccount[] = []
    const resolvedMultisigs = validMultisigs.content
      .map((validMultisig) => {
        const pubKeyWithIndex = publicKeysWithIndices.find(({ pubKey }) =>
          validMultisig.signers.some(
            (signer) => num.toBigInt(signer) === num.toBigInt(pubKey),
          ),
        )
        if (!pubKeyWithIndex) {
          return
        }
        multisigToInsert.push({
          ...validMultisig,
          publicKey: pubKeyWithIndex.pubKey,
          networkId: network.id,
          updatedAt: Date.now(),
        })

        return {
          ...this.walletAccountSharedService.getDefaultMultisigAccount({
            index: pubKeyWithIndex.index,
            address: validMultisig.address,
            network,
            needsDeploy: false,
            signerType,
          }),
          type: "multisig",
        }
      })
      .filter((m): m is WalletAccount => !!m)

    const multisigAccountsWithDetails = (
      await getAndMergeAccountDetails(resolvedMultisigs, [
        getAccountClassHashFromChain,
      ])
    ).sort(sortMultisigByDerivationPath)
    await this.multisigStore.upsert(multisigToInsert)
    return multisigAccountsWithDetails
  }

  private async fetchValidSmartAccounts(
    tempAccounts: WalletAccount[],
    network: Network,
  ) {
    const pukKeysAddresses = tempAccounts
      .map((account) => account.owner)
      .filter((address) => !!address)

    const discoveryUrl = this.getSmartAccountDiscoveryUrl(network)

    const validAccountsResponse = discoveryUrl
      ? await this.fetchSmartAccountsFromBackend(
          pukKeysAddresses as string[],
          discoveryUrl,
        )
      : []

    if (isEmpty(validAccountsResponse)) {
      return []
    }

    return tempAccounts.reduce((acc: WalletAccount[], account) => {
      const validAccount = validAccountsResponse.find((a) => {
        return account.owner && isEqualAddress(account.owner, a.ownerAddress)
      })
      const hasGuardian = !isEmpty(validAccount?.guardianAddresses)

      if (validAccount) {
        const isSmartAccount = hasGuardian && validAccount.salt
        const accountWithDetails = {
          ...account,
          address: validAccount.account,
          guardian: hasGuardian
            ? validAccount.guardianAddresses?.[0]
            : undefined,
          salt: isSmartAccount // we store the salt only for smart accounts
            ? addressSchema.parse(validAccount.salt)
            : undefined,
          owner: undefined, //no need to store the owner
          needsDeploy:
            validAccount.deployed !== undefined
              ? !validAccount.deployed
              : undefined,
        }

        if (account.owner && isSmartAccount) {
          try {
            const implementation = findImplementationForAccount(
              account.owner,
              accountWithDetails,
            )
            accountWithDetails.classHash = implementation.accountClassHash
          } catch {
            // If we cannot find the implementation, we use the class hash from the backend
            accountWithDetails.classHash = validAccount.classHash
          }
        }

        acc.push(accountWithDetails)
      }
      return acc
    }, [])
  }

  private async getAccountDetails(accounts: WalletAccount[]) {
    try {
      const standardAccountDetailFetchers: DetailFetchers[] = [
        getAccountDeployStatusFromChain,
        getAccountClassHashFromChain,
        getAccountEscapeFromChain,
        getAccountGuardiansFromChain,
        getAccountCairoVersionFromChain,
      ]

      // Partition accounts into multisig and non-multisig
      // because we already know the account type for multisig accounts
      // and multisig doesn't support guardians
      const [multisigAccounts, otherAccounts] = partition(
        accounts,
        (account) => account.type === "multisig",
      )

      const standardAccountsWithDetails = (
        await getAndMergeAccountDetails(
          otherAccounts,
          standardAccountDetailFetchers,
        )
      ).sort(sortAccountsByDerivationPath)

      const multisigAccountsWithDetails = (
        await getAndMergeAccountDetails(multisigAccounts, [
          getAccountClassHashFromChain,
        ])
      ).sort(sortMultisigByDerivationPath)

      return standardAccountsWithDetails.concat(multisigAccountsWithDetails)
    } catch (error) {
      console.error(
        "Error getting account types or guardians from chain",
        error,
      )
      throw new RecoveryError({
        code: "ACCOUNT_DETAILS_FETCH_FAILED",
      })
    }
  }
}
