import {
  utils,
  KeyPair,
  CompiledContract,
  getKeyPair,
  getStarkKey,
  deployContract,
  Contract,
  AddTransactionResponse,
  Args,
  hashMessage,
  sign,
  Calldata,
  genKeyPair,
} from "starknet"
import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"

const ArgentCompiledContractJson: CompiledContract = utils.json.parse(
  ArgentCompiledContract,
)

export class Wallet {
  address: string
  signer: KeyPair
  deployTransaction?: string
  contract: Contract

  constructor(address: string, signer: KeyPair, deployTransaction?: string) {
    this.address = address
    this.signer = signer
    this.deployTransaction = deployTransaction
    this.contract = new Contract(ArgentCompiledContractJson.abi, address)

    if (deployTransaction) {
      localStorage.setItem(`walletTx:${address}`, deployTransaction)
    } else if (localStorage.getItem(`walletTx:${address}`)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.deployTransaction = localStorage.getItem(`walletTx:${address}`)!
    }
  }

  public completeDeployTx(): void {
    localStorage.removeItem(`walletTx:${this.address}`)
    this.deployTransaction = undefined
  }

  public async getCurrentNonce(): Promise<string> {
    const { nonce } = await this.contract.call("get_current_nonce")
    return nonce.toString()
  }

  public async invoke(
    address: string,
    method: string,
    args?: Args | Calldata,
  ): Promise<AddTransactionResponse> {
    const nonce = await this.getCurrentNonce()
    const messageHash = utils.enc.addHexPrefix(
      hashMessage(
        "0",
        address,
        utils.starknet.getSelectorFromName(method),
        Array.isArray(args) ? args : Contract.compileCalldata(args || {}),
        nonce,
      ),
    )
    const { r, s } = sign(this.signer, messageHash)

    return this.contract.invoke(
      "execute",
      {
        to: address,
        selector: utils.starknet.getSelectorFromName(method),
        calldata: Array.isArray(args)
          ? args
          : Contract.compileCalldata(args || {}),
        nonce,
      },
      [r, s],
    )
  }

  public static async fromDeploy(
    seedOrKeyPair: string | KeyPair,
    l1Address = "0",
    overwriteSeed?: string,
  ): Promise<Wallet> {
    const starkKeyPair =
      typeof seedOrKeyPair === "string"
        ? getKeyPair(seedOrKeyPair)
        : seedOrKeyPair
    const starkPub = getStarkKey(starkKeyPair)

    const seed = overwriteSeed ?? getStarkKey(genKeyPair())

    const deployTransaction = await deployContract(
      ArgentCompiledContract,
      Contract.compileCalldata({
        signer: starkPub,
        guardian: "0",
        L1_address: utils.starknet.makeAddress(l1Address),
      }),
      seed,
    )

    if (deployTransaction.code !== "TRANSACTION_RECEIVED") {
      throw new Error("Deploy transaction failed")
    }

    return new Wallet(
      deployTransaction.address,
      starkKeyPair,
      deployTransaction.transaction_hash,
    )
  }
}
