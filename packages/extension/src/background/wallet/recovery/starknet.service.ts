import { WalletAccountSharedService } from "../../../shared/account/service/shared.service"
import { networkIdToStarknetNetwork } from "./../../../shared/utils/starknetNetwork"
import { union, partition, memoize } from "lodash-es"
import { num, RpcProvider } from "starknet"

import { BaseMultisigWalletAccount } from "../../../shared/wallet.model"
import {
  getAccountClassHashFromChain,
  getAccountCairoVersionFromChain,
  getAccountDeployStatusFromChain,
  getAccountEscapeFromChain,
  getAccountGuardiansFromChain,
} from "../../../shared/account/details"
import {
  DetailFetchers,
  getAndMergeAccountDetails,
} from "../../../shared/account/details/getAndMergeAccountDetails"
import { Network, getProvider } from "../../../shared/network"
import { WalletAccount } from "../../../shared/wallet.model"
import {
  MULTISIG_DERIVATION_PATH,
  STANDARD_DERIVATION_PATH,
} from "../../../shared/wallet.service"

import {
  PublicKeyWithIndex,
  generatePublicKeys,
} from "../../keys/keyDerivation"
import { WalletCryptoStarknetService } from "../crypto/starknet.service"
import { ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES } from "../../../shared/account/starknet.constants"
import { IWalletRecoveryService } from "./interface"
import { IRepository } from "../../../shared/storage/__new/interface"
import urlJoin from "url-join"
import {
  ARGENT_ACCOUNT_DISCOVERY_URL,
  ARGENT_MULTISIG_DISCOVERY_URL,
} from "../../../shared/api/constants"
import { z } from "zod"
import {
  ApiMultisigDataForSigner,
  ApiMultisigDataForSignerSchema,
} from "../../../shared/multisig/multisig.model"
import { RecoveryError } from "../../../shared/errors/recovery"
import { Address, isContractDeployed } from "@argent/x-shared"
import { getAccountContractAddress } from "../findImplementationForAddress"
import {
  argentApiNetworkForNetwork,
  argentXHeaders,
} from "../../../shared/api/headers"

const INITIAL_PUB_KEY_COUNT = 20

interface TempAccountData {
  account: WalletAccount
  pubKeyWithIndex: PublicKeyWithIndex
}

export class WalletRecoveryStarknetService implements IWalletRecoveryService {
  constructor(
    private readonly walletStore: IRepository<WalletAccount>,
    private readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly walletAccountSharedService: WalletAccountSharedService,
  ) {}

  private getCairo1AccountContractAddressMemoized = memoize(
    (classHash: string, publicKey: string) =>
      getAccountContractAddress("1", classHash, publicKey),
    (classHash, publicKey) => `${classHash}:${publicKey}`,
  )

  private getCairo0AccountContractAddressMemoized = memoize(
    (classHash: string, publicKey: string) =>
      getAccountContractAddress("0", classHash, publicKey),
    (classHash, publicKey) => `${classHash}:${publicKey}`,
  )

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
        STANDARD_DERIVATION_PATH,
        MULTISIG_DERIVATION_PATH,
      ].map((derivationPath) =>
        generatePublicKeys(
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

      const tempAccounts = tempAccountsData.map(({ account }) => account)

      const [validAccounts, validMultisigs] = await Promise.all([
        this.fetchValidAccounts(tempAccounts, network),
        this.fetchValidMultisigAccounts(multisigAccountPubKeys, network),
      ])

      accounts.push(...validAccounts, ...validMultisigs)

      lastCheck += initialPubKeyCount

      pubKeyCount = validAccounts.length + validMultisigs.length
    }

    const accountsWithDetails = await this.getAccountDetails(accounts)

    return accountsWithDetails
  }

  private getStandardAccountDiscoveryUrl(network: Network) {
    const backendNetwork = argentApiNetworkForNetwork(network.id)

    if (
      process.env.NODE_ENV !== "production" && // be more strict in development
      !ARGENT_ACCOUNT_DISCOVERY_URL
    ) {
      throw new RecoveryError({
        code: "ARGENT_ACCOUNT_DISCOVERY_URL_NOT_SET",
      })
    }

    if (!backendNetwork || !ARGENT_ACCOUNT_DISCOVERY_URL) {
      // and more lax in production
      return
    }

    return urlJoin(ARGENT_ACCOUNT_DISCOVERY_URL, backendNetwork)
  }

  private getMultisigDiscoveryUrl(network: Network) {
    const backendNetwork = networkIdToStarknetNetwork(network.id)

    // Don't check for multisig accounts if the network doesn't support them
    if (!network.accountClassHash?.multisig) {
      return
    }

    const baseDiscoveryUrl = ARGENT_MULTISIG_DISCOVERY_URL

    if (!baseDiscoveryUrl) {
      throw new RecoveryError({
        code: "ARGENT_MULTISIG_DISCOVERY_URL_NOT_SET",
      })
    }

    return urlJoin(baseDiscoveryUrl, backendNetwork)
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
      ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1,
      [...(defaultClassHash ? [defaultClassHash] : [])],
    )

    return cairo1AccountClassHashes.map((accountClassHash) => {
      const address = this.getCairo1AccountContractAddressMemoized(
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

  private buildCairo0Accounts(
    network: Network,
    pubKeyWithIndex: PublicKeyWithIndex,
    defaultClassHash?: string,
  ) {
    // Discover Cairo0 standard accounts
    const cairo0AccountClassHashes = union(
      ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_0,
      [...(defaultClassHash ? [defaultClassHash] : [])],
    )

    return cairo0AccountClassHashes.map((accountClassHash) => {
      const address = this.getCairo0AccountContractAddressMemoized(
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
    const tempAddresses = tempAccounts.map((account) => account.address)
    const discoveryUrl = this.getStandardAccountDiscoveryUrl(network)

    const validAccountsResponse = discoveryUrl
      ? await this.fetchValidAccountsFromBackend(tempAddresses, discoveryUrl)
      : await this.fetchValidAccountsFromOnchain(tempAddresses, network)

    const validAccountAddresses = new Set(
      z.array(z.string()).parse(validAccountsResponse),
    )

    return tempAccounts.filter((account) =>
      validAccountAddresses.has(account.address),
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
    addresses: string[],
    discoveryUrl: string,
  ): Promise<string[]> {
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
    const validAccountAddresses = new Set(
      z.array(z.string()).parse(validAccountsResponse),
    )

    return addresses.filter((address) => validAccountAddresses.has(address))
  }

  private async fetchValidAccountsFromOnchain(
    addresses: string[],
    network: Network,
  ): Promise<string[]> {
    const provider = getProvider(network)
    const isNetworkAvailable = await this.isNetworkAvailable(provider)

    if (!isNetworkAvailable) {
      return []
    }

    const validAccounts = await Promise.all(
      addresses.map(async (address) =>
        (await isContractDeployed(provider, address)) ? address : undefined,
      ),
    )

    return validAccounts.filter((account): account is string => !!account)
  }

  private async fetchValidMultisigAccounts(
    publicKeysWithIndices: PublicKeyWithIndex[],
    network: Network,
  ) {
    const multisigDiscoveryUrl = this.getMultisigDiscoveryUrl(network)

    if (!multisigDiscoveryUrl) {
      return []
    }

    const response = await fetch(multisigDiscoveryUrl, {
      method: "POST",
      body: JSON.stringify(publicKeysWithIndices.map(({ pubKey }) => pubKey)),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...argentXHeaders,
      },
    })

    if (!response.ok) {
      throw new RecoveryError({
        code: "MULTISIG_DISCOVERY_REQUEST_FAILED",
      })
    }

    const validMultisigsResponse = await response.json()

    const validMultisigs = ApiMultisigDataForSignerSchema.parse(
      validMultisigsResponse,
    )

    const resolvedMultisigs = await this.resolveValidMultisigs(
      validMultisigs,
      publicKeysWithIndices,
      network,
    )
    return resolvedMultisigs.filter((m): m is WalletAccount => !!m)
  }

  private async resolveValidMultisigs(
    validMultisigs: ApiMultisigDataForSigner,
    publicKeysWithIndices: PublicKeyWithIndex[],
    network: Network,
  ) {
    const multisigToInsert: BaseMultisigWalletAccount[] = []
    const resolvedMultisigs = validMultisigs.content.map((validMultisig) => {
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
        }),
        type: "multisig",
      }
    })

    await this.multisigStore.upsert(multisigToInsert)
    return resolvedMultisigs
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

      const standardAccountsWithDetails = await getAndMergeAccountDetails(
        otherAccounts,
        standardAccountDetailFetchers,
      )

      return multisigAccounts.concat(standardAccountsWithDetails)
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
