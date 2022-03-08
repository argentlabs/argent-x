import { BigNumber } from "@ethersproject/bignumber"
import { hexZeroPad, hexDataLength } from "@ethersproject/bytes"
import Eth from "@ledgerhq/hw-app-eth"
import Transport from "@ledgerhq/hw-transport"
import TransportWebHID from "@ledgerhq/hw-transport-webhid"
import {Signature, typedData} from "starknet"
import { ethers } from "ethers"

export enum StarkSignerType {
  Local,
  Ledger,
}

/*export interface Signature {
  r: BigNumber
  s: BigNumber
}*/

export interface StarkSigner {
  type: StarkSignerType
  starkPub: string
  connect: () => Promise<string>
  signMessage: (messageHash: typedData.TypedData) => Promise<Signature>
}

export class LedgerSigner implements StarkSigner {
  type = StarkSignerType.Ledger
  derivationPath = "/2645'/579218131'/1148870696'/0'/0'/0"
  starkPub = ""
  static transport: Transport

  static async getEthApp(): Promise<Eth> {
    console.log("isSupported", await TransportWebHID.isSupported())
    if (!this.transport) {
      console.log("create TransportWebHID")
      this.transport = await TransportWebHID.create()
    }
    return new Eth(this.transport)
  }

  async connect(): Promise<string> {
    const eth = await LedgerSigner.getEthApp()

    const response = await eth.starkGetPublicKey(this.derivationPath)
    this.starkPub = `0x${response.slice(1, 1 + 32).toString("hex")}`

    return this.starkPub
  }

  async signMessage(message: typedData.TypedData): Promise<Signature> {
    const eth = await LedgerSigner.getEthApp()

    const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(message)));

    console.log("Message to be signed by Nano " + messageHash)

    const signature = (await eth.starkUnsafeSign(
      this.derivationPath,
      hexZeroPad(messageHash, 32),
    )) as { r: string; s: string }

    return [BigNumber.from(`0x${signature.r}`), BigNumber.from(`0x${signature.s}`)]
  }

  static async askPermissionIfNeeded(): Promise<void> {
    const transport = await TransportWebHID.create()
    await transport.close()
  }
}
