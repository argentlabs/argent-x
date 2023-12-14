import {
  AddAccountResponse,
  IMultisigService,
} from "../../../../shared/multisig/service/messaging/interface"
import { tryToMintFeeToken } from "../../../../shared/devnet/mintFeeToken"
import { analytics } from "../../../analytics"
import { getMultisigAccounts } from "../../../../shared/multisig/utils/baseMultisig"
import {
  AddAccountPayload,
  AddOwnerMultisigPayload,
  RemoveOwnerMultisigPayload,
  ReplaceOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../../../../shared/multisig/multisig.model"
import { Wallet } from "../../../wallet"
import { CallData, DeployAccountContractPayload } from "starknet"
import { IBackgroundActionService } from "../action/interface"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import {
  MultisigEntryPointType,
  MultisigTransactionType,
  PendingMultisig,
} from "../../../../shared/multisig/types"
import { MultisigAccount } from "../../../../shared/multisig/account"
import {
  addOwnersCalldataSchema,
  changeThresholdCalldataSchema,
  decodeBase58,
  decodeBase58Array,
  removeOwnersCalldataSchema,
  replaceSignerCalldataSchema,
} from "@argent/shared"
import { AccountError } from "../../../../shared/errors/account"
import { getMultisigPendingTransaction } from "../../../../shared/multisig/pendingTransactionsStore"
import { MultisigError } from "../../../../shared/errors/multisig"

export default class BackgroundMultisigService implements IMultisigService {
  constructor(
    private wallet: Wallet,
    private actionService: IBackgroundActionService,
  ) {}
  async addAccount(payload: AddAccountPayload): Promise<AddAccountResponse> {
    const { networkId, signers, threshold, creator, publicKey, updatedAt } =
      payload
    try {
      const account = await this.wallet.newAccount(networkId, "multisig", {
        signers,
        threshold,
        creator,
        publicKey,
        updatedAt,
      })
      await tryToMintFeeToken(account)

      void analytics.track("createAccount", {
        status: "success",
        networkId,
        type: "multisig",
      })

      const accounts = await getMultisigAccounts()

      return {
        account,
        accounts,
      }
    } catch (error) {
      void analytics.track("createAccount", {
        status: "failure",
        networkId: networkId,
        type: "multisig",
        errorMessage: `${error}`,
      })

      throw error
    }
  }

  async addOwner(payload: AddOwnerMultisigPayload): Promise<void> {
    const { address, signersToAdd, newThreshold } = payload

    const signersPayload = {
      entrypoint: MultisigEntryPointType.ADD_SIGNERS,
      calldata: CallData.compile(
        addOwnersCalldataSchema.parse({
          new_threshold: newThreshold.toString(),
          signers_to_add: decodeBase58Array(signersToAdd),
        }),
      ),
      contractAddress: address,
    }
    const title = `Add owner${
      signersToAdd.length > 1 ? "s" : ""
    } and set confirmations to ${newThreshold}`
    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: signersPayload,
          meta: {
            title: "Add signers",
            type: MultisigTransactionType.MULTISIG_ADD_SIGNERS,
          },
        },
      },
      {
        title,
        icon: "MultisigJoinIcon",
      },
    )
  }

  async removeOwner(payload: RemoveOwnerMultisigPayload): Promise<void> {
    const { address, signerToRemove, newThreshold } = payload

    const signersToRemove = [decodeBase58(signerToRemove)]

    const signersPayload = {
      entrypoint: MultisigEntryPointType.REMOVE_SIGNERS,
      calldata: CallData.compile(
        removeOwnersCalldataSchema.parse({
          new_threshold: newThreshold.toString(),
          signers_to_remove: signersToRemove,
        }),
      ),

      contractAddress: address,
    }
    const title = `Remove owner${
      signersToRemove.length > 1 ? "s" : ""
    } and set confirmations to ${newThreshold}}`
    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: signersPayload,
          meta: {
            type: MultisigTransactionType.MULTISIG_REMOVE_SIGNERS,
          },
        },
      },
      {
        title,
        icon: "MultisigRemoveIcon",
      },
    )
  }

  async replaceOwner(payload: ReplaceOwnerMultisigPayload): Promise<void> {
    const { signerToRemove, signerToAdd, address } = payload

    const decodedSignerToRemove = decodeBase58(signerToRemove)
    const decodedSignerToAdd = decodeBase58(signerToAdd)

    const signersPayload = {
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: CallData.compile(
        replaceSignerCalldataSchema.parse({
          signer_to_remove: decodedSignerToRemove,
          signer_to_add: decodedSignerToAdd,
        }),
      ),
      contractAddress: address,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: signersPayload,
          meta: {
            type: MultisigTransactionType.MULTISIG_REPLACE_SIGNER,
          },
        },
      },
      {
        title: "Replace owner",
        icon: "MultisigReplaceIcon",
      },
    )
  }

  async addPendingAccount(networkId: string): Promise<PendingMultisig> {
    return await this.wallet.newPendingMultisig(networkId)
  }

  async addTransactionSignature(requestId: string): Promise<string> {
    const selectedAccount = await this.wallet.getSelectedAccount()

    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    const multisigStarknetAccount = await this.wallet.getStarknetAccount(
      selectedAccount,
    )

    if (!MultisigAccount.isMultisig(multisigStarknetAccount)) {
      throw new AccountError({ code: "NOT_MULTISIG" })
    }

    const transactionToSign = await getMultisigPendingTransaction(requestId)

    if (!transactionToSign) {
      throw new MultisigError({
        code: "PENDING_MULTISIG_TRANSACTION_NOT_FOUND",
        message: `Pending Multisig transaction ${requestId} not found`,
      })
    }

    const { transaction_hash } =
      await multisigStarknetAccount.addRequestSignature(transactionToSign)

    return transaction_hash
  }

  async deploy(account: BaseWalletAccount): Promise<void> {
    let displayCalldata: string[] = []
    const walletAccount = await this.wallet.getAccount(account)
    if (!walletAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }
    try {
      /** determine the calldata to display to the end user */
      const deployAccountPayload =
        await this.wallet.getMultisigDeploymentPayload(walletAccount)
      const { constructorCalldata } = deployAccountPayload
      displayCalldata = CallData.toCalldata(constructorCalldata)
    } catch {
      /** ignore non-critical error */
    }

    await this.actionService.add(
      {
        type: "DEPLOY_MULTISIG",
        payload: {
          account,
          displayCalldata,
        },
      },
      {
        title: "Activate multisig",
        icon: "MultisigIcon",
      },
    )
  }

  async updateThreshold(
    payload: UpdateMultisigThresholdPayload,
  ): Promise<void> {
    const { address, newThreshold } = payload

    const thresholdPayload = {
      entrypoint: MultisigEntryPointType.CHANGE_THRESHOLD,
      calldata: changeThresholdCalldataSchema.parse([newThreshold.toString()]),
      contractAddress: address,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: thresholdPayload,
          meta: {
            type: MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD,
          },
        },
      },
      {
        title: `Set confirmations to ${newThreshold}`,
        icon: "ApproveIcon",
      },
    )
  }
}
