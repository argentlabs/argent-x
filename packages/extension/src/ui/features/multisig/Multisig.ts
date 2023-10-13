import { PendingMultisig } from "../../../shared/multisig/types"
import { networkService } from "../../../shared/network/service"
import {
  BaseMultisigWalletAccount,
  MultisigData,
} from "../../../shared/wallet.model"
import { multisigService } from "../../services/multisig"
import { Account, AccountConstructorProps } from "../accounts/Account"

export interface MultisigConstructorProps extends AccountConstructorProps {
  signers: string[]
  threshold: number
  creator?: string // Creator is the public key of the account that created the multisig account
  publicKey: string
  updatedAt?: number
}

export const ZERO_MULTISIG: MultisigData = {
  signers: [],
  threshold: 0,
  creator: undefined,
  publicKey: "0x0",
  updatedAt: Date.now(),
}

export class Multisig extends Account {
  signers: string[]
  threshold: number
  creator?: string
  publicKey: string
  updatedAt: number

  constructor(props: MultisigConstructorProps) {
    super(props)
    this.signers = props.signers
    this.threshold = props.threshold
    this.creator = props.creator
    this.publicKey = props.publicKey
    this.updatedAt = props.updatedAt || Date.now()
  }

  // Create Method Overload
  public static async create(networkId: string): Promise<Multisig>
  public static async create(
    networkId: string,
    providedMultisigData: MultisigData,
  ): Promise<Multisig>

  public static async create(
    networkId: string,
    providedMultisigData?: MultisigData,
  ): Promise<Multisig>

  /**
   * Create a new multisig account
   * If multisigPayload is provided, it will be used to create the multisig account
   * If not, a new multisig account will be created with a 0 signers and a threshold of 0
   * This is useful for when you want to "join" a multisig account and the creator has not yet activated the account
   * Once the account is activated, update the account with the correct signers and threshold by fetching from the backend
   *
   *
   * @param  {string} networkId
   * @param  {MultisigData} providedMultisigData?
   * @returns Promise<Multisig>
   */
  public static async create(
    networkId: string,
    providedMultisigData?: MultisigData,
  ): Promise<Multisig> {
    const multisigPayload = providedMultisigData || ZERO_MULTISIG

    const result = await multisigService.addAccount({
      ...multisigPayload,
      networkId,
    })

    const network = await networkService.getById(networkId)

    if (!network) {
      throw new Error(`Network ${networkId} not found`)
    }

    return new Multisig({
      name: result.account.name,
      address: result.account.address,
      network,
      signer: result.account.signer,
      guardian: result.account.guardian,
      escape: result.account.escape,
      needsDeploy: result.account.needsDeploy,
      type: "multisig",
      signers: multisigPayload.signers,
      threshold: multisigPayload.threshold,
      creator: multisigPayload.creator,
      publicKey: multisigPayload.publicKey,
    })
  }

  public toBaseMultisigAccount(): BaseMultisigWalletAccount {
    const { networkId, address, signers, threshold, publicKey, updatedAt } =
      this

    return {
      networkId,
      address,
      signers,
      threshold,
      publicKey,
      updatedAt,
    }
  }

  public isZeroMultisig(): boolean {
    return this.signers.length === 0 && this.threshold === 0
  }
}

export const multisigIsPending = (
  multisig: Account | PendingMultisig,
): multisig is PendingMultisig => {
  return "publicKey" in multisig && !("address" in multisig)
}
