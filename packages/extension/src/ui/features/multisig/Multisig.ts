import { getNetwork } from "../../../shared/network"
import {
  BaseMultisigWalletAccount,
  MultisigData,
} from "../../../shared/wallet.model"
import { createNewMultisigAccount } from "../../services/backgroundAccounts"
import { Account, AccountConstructorProps } from "../accounts/Account"

export interface MultisigConstructorProps extends AccountConstructorProps {
  signers: string[]
  threshold: number
  creator?: string // Creator is the public key of the account that created the multisig account
}

export const ZERO_MULTISIG: MultisigData = {
  signers: [],
  threshold: 0,
  creator: undefined,
}

export class Multisig extends Account {
  signers: string[]
  threshold: number
  creator?: string

  constructor(props: MultisigConstructorProps) {
    super(props)
    this.signers = props.signers
    this.threshold = props.threshold
    this.creator = props.creator
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

    const result = await createNewMultisigAccount(networkId, multisigPayload)
    if (result === "error") {
      throw new Error(result)
    }

    const network = await getNetwork(networkId)

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
    })
  }

  public toBaseMultisigAccount(): BaseMultisigWalletAccount {
    const { networkId, address, signers, threshold } = this
    return {
      networkId,
      address,
      signers,
      threshold,
    }
  }

  public isZeroMultisig(): boolean {
    return this.signers.length === 0 && this.threshold === 0
  }
}
