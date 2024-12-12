import type { ILedgerSharedService } from "./ILedgerSharedService"
import type { Address } from "@argent/x-shared"
import {
  addressSchema,
  isEqualAddress,
  getLedgerAccountClassHashes,
} from "@argent/x-shared"
import TransportWebHID from "@ledgerhq/hw-transport-webhid"
import { StarknetClient } from "@ledgerhq/hw-app-starknet"
import { LedgerSigner } from "../../signer"
import type Transport from "@ledgerhq/hw-transport"
import { AxLedgerError } from "../../errors/ledger"
import { getBaseDerivationPath } from "../../signer/utils"
import { getMultisigDiscoveryUrl } from "../../multisig/utils/getMultisigDiscoveryUrl"
import { RecoveryError } from "../../errors/recovery"
import type { PublicKeyWithIndex } from "../../signer/types"
import type { CreateAccountType } from "../../wallet.model"
import { SignerType } from "../../wallet.model"
import { argentXHeaders } from "../../api/headers"
import { getStandardAccountDiscoveryUrl } from "../../utils/getStandardAccountDiscoveryUrl"
import { z } from "zod"
import { getCairo1AccountContractAddress } from "../../utils/getContractAddress"
import type { INetworkService } from "../../network/service/INetworkService"
import type { IMultisigBackendService } from "../../multisig/service/backend/IMultisigBackendService"
import { getBaseMultisigAccounts } from "../../multisig/utils/baseMultisig"

const NEXT_PUBLIC_KEY_BUFFER = 5

export class LedgerSharedService implements ILedgerSharedService {
  transport: Transport | null = null
  app: StarknetClient | null = null

  constructor(
    public readonly networkService: Pick<INetworkService, "getById">,
    public readonly multisigBackendService: IMultisigBackendService,
  ) {}

  async connect(): Promise<Address> {
    try {
      await this.makeApp()
      const baseDerivationPath = getBaseDerivationPath(
        "standard",
        SignerType.LEDGER,
      )
      const signer = await this.getSigner(baseDerivationPath + "/0")
      const pubKey = await signer.getPubKey()
      return addressSchema.parse(pubKey)
    } finally {
      void this.deinitApp()
    }
  }

  async getPubKey(derivationPath: string): Promise<Address> {
    try {
      await this.makeApp()
      const signer = await this._getSigner(derivationPath)
      const pubKey = await signer.getPubKey()
      return addressSchema.parse(pubKey)
    } finally {
      void this.deinitApp()
    }
  }

  async getNextAvailablePublicKey(
    accountType: CreateAccountType,
    currentIndex: number,
    usedIndices: number[],
    networkId: string,
  ) {
    switch (accountType) {
      case "multisig":
        return this.getNextPublicKeyForMultisig(
          currentIndex,
          usedIndices,
          networkId,
        )
      case "standard":
        return this.getNextPublicKeyForStandardAccount(
          currentIndex,
          usedIndices,
          networkId,
        )
      default:
        throw new AxLedgerError({ code: "UNSUPPORTED_ACCOUNT_TYPE" })
    }
  }

  private async getNextPublicKeyForStandardAccount(
    currentIndex: number,
    usedIndices: number[],
    networkId: string,
  ) {
    try {
      await this.makeApp()

      if (!this.app) {
        throw new AxLedgerError({ code: "APP_DOES_NOT_SEEM_TO_BE_OPEN" })
      }

      const baseDerivationPath = getBaseDerivationPath(
        "standard",
        SignerType.LEDGER,
      )

      const network = await this.networkService.getById(networkId)

      let found = false,
        nextAvailablePublicKey: PublicKeyWithIndex | undefined,
        startIndex = currentIndex

      while (!found) {
        // Generate 5 public keys starting from currentIndex
        const pubKeys = await LedgerSigner.generatePublicKeys(
          this.app,
          startIndex,
          5,
          baseDerivationPath,
        )

        const classHashes = getLedgerAccountClassHashes()

        const addressesWithPubKey = pubKeys.flatMap(({ pubKey, index }) =>
          classHashes.map((classHash) => ({
            address: getCairo1AccountContractAddress(classHash, pubKey),
            pubKey,
            index,
          })),
        )

        const discoveryUrl = getStandardAccountDiscoveryUrl(network.id)

        if (!discoveryUrl) {
          throw new RecoveryError({
            code: "ARGENT_ACCOUNT_DISCOVERY_URL_NOT_SET",
          })
        }

        const response = await fetch(discoveryUrl, {
          method: "POST",
          body: JSON.stringify(
            addressesWithPubKey.map(({ address }) => address),
          ),
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
          z.array(addressSchema).parse(validAccountsResponse),
        )

        // find the first public key that is not associated with an account and the index is not used
        nextAvailablePublicKey = addressesWithPubKey.find(
          ({ address, index }) =>
            !usedIndices.includes(index) && !validAccountAddresses.has(address),
        )

        if (nextAvailablePublicKey) {
          found = true
        } else {
          // If no public key is available, increment the startIndex by NEXT_PUBLIC_KEY_BUFFER amount and try again
          startIndex += NEXT_PUBLIC_KEY_BUFFER
        }
      }

      if (!nextAvailablePublicKey) {
        // This should never happen
        throw new AxLedgerError({ code: "PUBKEY_GENERATION_ERROR" })
      }

      return nextAvailablePublicKey
    } catch (error) {
      console.error(error)
      throw new AxLedgerError({ code: "PUBKEY_GENERATION_ERROR" })
    } finally {
      void this.deinitApp()
    }
  }

  private async getNextPublicKeyForMultisig(
    currentIndex: number,
    usedIndices: number[],
    networkId: string,
  ) {
    try {
      await this.makeApp()
      const baseDerivationPath = getBaseDerivationPath(
        "multisig",
        SignerType.LEDGER,
      )
      if (!this.app) {
        throw new AxLedgerError({ code: "APP_DOES_NOT_SEEM_TO_BE_OPEN" })
      }

      const network = await this.networkService.getById(networkId)
      const multisigDiscoveryUrl = getMultisigDiscoveryUrl(network)

      if (!multisigDiscoveryUrl) {
        throw new RecoveryError({
          code: "ARGENT_MULTISIG_DISCOVERY_URL_NOT_SET",
        })
      }

      let found = false,
        nextAvailablePublicKey: PublicKeyWithIndex | undefined,
        startIndex = currentIndex

      while (!found) {
        // Generate 5 public keys starting from currentIndex
        const pubKeys = await LedgerSigner.generatePublicKeys(
          this.app,
          startIndex,
          5,
          baseDerivationPath,
        )

        // Check with multisig backend recovery endpoint to find the next public key with no account associated
        const multisigs = await this.multisigBackendService.discoverMultisigs(
          network,
          pubKeys.map(({ pubKey }) => pubKey),
        )

        const pendingPubKeys = (await getBaseMultisigAccounts())
          .map((m) => m.pendingSigner?.pubKey)
          .filter((m) => !!m) as string[]

        // find the first public key that is not associated with an account, the index is not used and it's not involved in any change signer operations
        nextAvailablePublicKey = pubKeys.find(
          ({ pubKey, index }) =>
            !usedIndices.includes(index) &&
            !multisigs.content.some((multisig) =>
              multisig.signers.some((signer) => isEqualAddress(signer, pubKey)),
            ) &&
            !pendingPubKeys.some((key) => isEqualAddress(key, pubKey)),
        )

        if (nextAvailablePublicKey) {
          found = true
        } else {
          // If no public key is available, increment the startIndex by NEXT_PUBLIC_KEY_BUFFER amount and try again
          startIndex += NEXT_PUBLIC_KEY_BUFFER
        }
      }

      if (!nextAvailablePublicKey) {
        // This should never happen
        throw new AxLedgerError({ code: "PUBKEY_GENERATION_ERROR" })
      }

      return nextAvailablePublicKey
    } catch (error) {
      console.error(error)
      throw new AxLedgerError({ code: "PUBKEY_GENERATION_ERROR" })
    } finally {
      void this.deinitApp()
    }
  }

  async generatePublicKeys(
    accountType: CreateAccountType,
    start: number,
    numberOfPairs = NEXT_PUBLIC_KEY_BUFFER,
  ) {
    try {
      await this.makeApp()
      if (!this.app) {
        throw new AxLedgerError({ code: "APP_DOES_NOT_SEEM_TO_BE_OPEN" })
      }
      const baseDerivationPath = getBaseDerivationPath(
        accountType,
        SignerType.LEDGER,
      )
      const pubKeys = await LedgerSigner.generatePublicKeys(
        this.app,
        start,
        numberOfPairs,
        baseDerivationPath,
      )
      return pubKeys
    } finally {
      void this.deinitApp()
    }
  }

  async getSigner(derivationPath: string): Promise<LedgerSigner> {
    return this._getSigner(derivationPath)
  }

  async makeApp() {
    try {
      if (!this.app) {
        this.transport = await TransportWebHID.create()
        const app = new StarknetClient(this.transport)
        this.app = app
        return app
      }
      return this.app
    } catch (error) {
      console.error(error)
      throw new AxLedgerError({ code: "TRANSPORT_OPEN_ERROR" })
    }
  }

  private async _getSigner(derivationPath: string) {
    return new LedgerSigner(this, derivationPath)
  }

  /**
   * Deinitializes the app by nullifying the app instance and closing the transport connection.
   * This is necessary to ensure that the ledger device is properly disconnected and ready for future operations,
   * preventing any potential communication issues or resource leaks that could occur if the device remains connected.
   */
  public async deinitApp() {
    this.app = null
    if (this.transport) {
      await this.transport.close()
      this.transport = null
    }
  }
}
