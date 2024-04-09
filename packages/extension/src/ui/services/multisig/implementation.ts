import { messageClient } from "../messaging/trpc"
import { AddAccountResponse } from "../../../shared/multisig/service/messaging/interface"
import {
  AddAccountPayload,
  AddOwnerMultisigPayload,
  RemoveOwnerMultisigPayload,
  ReplaceOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../../../shared/multisig/multisig.model"
import {
  BaseWalletAccount,
  baseWalletAccountSchema,
} from "../../../shared/wallet.model"
import { PendingMultisig, SignerMetadata } from "../../../shared/multisig/types"
import { IClientMultisigService } from "./interface"
import { multisigMetadataRepo } from "../../../shared/multisig/repository"
import {
  isEqualAddress,
  decodeBase58Array,
  ensureArray,
} from "@argent/x-shared"

export class MultisigService implements IClientMultisigService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async addAccount(payload: AddAccountPayload): Promise<AddAccountResponse> {
    const decodedSigners = decodeBase58Array(payload.signers)
    return await this.trpcMessageClient.multisig.addAccount.mutate({
      ...payload,
      signers: decodedSigners,
    })
  }

  async addOwner(payload: AddOwnerMultisigPayload): Promise<void> {
    await this.trpcMessageClient.multisig.addOwner.mutate(payload)
  }

  async removeOwner(payload: RemoveOwnerMultisigPayload): Promise<void> {
    await this.trpcMessageClient.multisig.removeOwner.mutate(payload)
  }

  async replaceOwner(payload: ReplaceOwnerMultisigPayload): Promise<void> {
    await this.trpcMessageClient.multisig.replaceOwner.mutate(payload)
  }

  async addPendingAccount(networkId: string): Promise<PendingMultisig> {
    return await this.trpcMessageClient.multisig.addPendingAccount.mutate({
      networkId,
    })
  }

  async addTransactionSignature(requestId: string): Promise<string> {
    return await this.trpcMessageClient.multisig.addTransactionSignature.mutate(
      { requestId },
    )
  }

  async deploy(account: BaseWalletAccount): Promise<void> {
    const parsedAccount = baseWalletAccountSchema.parse(account)

    await this.trpcMessageClient.multisig.deploy.mutate(parsedAccount)
  }

  async updateThreshold(
    payload: UpdateMultisigThresholdPayload,
  ): Promise<void> {
    await this.trpcMessageClient.multisig.updateThreshold.mutate(payload)
  }

  async updateSignerMetadata(
    multisigPublicKey: string,
    signerMetadata: SignerMetadata,
  ): Promise<void> {
    const [multisigMetadata] = await multisigMetadataRepo.get(
      (multisigMetadata) =>
        isEqualAddress(multisigMetadata.multisigPublicKey, multisigPublicKey),
    )

    const signers = multisigMetadata?.signers.slice() || []
    const signerIndex = signers?.findIndex((signer) =>
      isEqualAddress(signer.key, signerMetadata.key),
    )

    // Signer is not in signer metadata list, add it
    if (signerIndex === -1) {
      signers.push(signerMetadata)
    } else {
      signers[signerIndex] = signerMetadata
    }

    await multisigMetadataRepo.upsert({
      multisigPublicKey,
      signers,
    })
  }

  async updateSignersMetadata(
    multisigPublicKey: string,
    signersMetadata: SignerMetadata[],
  ): Promise<void> {
    const [multisigMetadata] = await multisigMetadataRepo.get(
      (multisigMetadata) =>
        isEqualAddress(multisigMetadata.multisigPublicKey, multisigPublicKey),
    )

    const signers = ensureArray(multisigMetadata?.signers.slice())

    for (const signerMetadata of signersMetadata) {
      const signerIndex = ensureArray(signers).findIndex((signer) =>
        isEqualAddress(signer.key, signerMetadata.key),
      )

      // Signer is not in signer metadata list, add it
      if (signerIndex === -1) {
        signers.push(signerMetadata)
      } else {
        signers[signerIndex] = signerMetadata
      }
    }

    await multisigMetadataRepo.upsert({
      multisigPublicKey,
      signers,
    })
  }

  async removeSignerMetadata(
    multisigPublicKey: string,
    signerKey: string,
  ): Promise<void> {
    const [multisigMetadata] = await multisigMetadataRepo.get(
      (multisigMetadata) =>
        isEqualAddress(multisigMetadata.multisigPublicKey, multisigPublicKey),
    )

    const signers = ensureArray(multisigMetadata?.signers.slice())

    if (signers.length === 0) {
      return
    }

    const signerIndex = signers?.findIndex((signer) =>
      isEqualAddress(signer.key, signerKey),
    )

    // Signer is not in signer metadata list, do nothing
    if (signerIndex === -1) {
      return
    } else {
      signers.splice(signerIndex, 1)
    }

    await multisigMetadataRepo.upsert({
      multisigPublicKey,
      signers,
    })
  }
}
