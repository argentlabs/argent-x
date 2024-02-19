import {
  NftItem,
  formatAddress,
  getUint256CalldataFromBN,
  isAddress,
} from "@argent/shared"
import { CallData } from "starknet"

import { messageClient } from "../messaging/trpc"
import { Network } from "../../../shared/network"
import { IClientNftService } from "./interface"
import { IClientStarknetAddressService } from "../address/interface"

export class ClientNftService implements IClientNftService {
  constructor(
    private trpcMessageClient: typeof messageClient,
    private readonly starknetAddressService: IClientStarknetAddressService,
  ) {}

  async transferNft(
    network: Network,
    nft: NftItem,
    accountAddress: string,
    recipient: string,
  ) {
    let parsedRecipient = null
    let parsedContractAddress = null
    let parsedAccountAddress = null

    try {
      parsedContractAddress =
        await this.starknetAddressService.parseAddressOrDomain(
          nft.contract_address,
          network.id,
        )

      parsedAccountAddress =
        await this.starknetAddressService.parseAddressOrDomain(
          accountAddress,
          network.id,
        )

      parsedRecipient = await this.starknetAddressService.parseAddressOrDomain(
        recipient,
        network.id,
      )
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }

    let compiledCalldata = CallData.toCalldata({
      from_: parsedAccountAddress,
      to: parsedRecipient,
      tokenId: getUint256CalldataFromBN(nft.token_id), // OZ specs need a uint256 as tokenId
    })

    const transactions = {
      contractAddress: parsedContractAddress,
      entrypoint: "transferFrom",
      calldata: compiledCalldata,
    }

    if (nft.spec !== "ERC721") {
      transactions.entrypoint = "safeTransferFrom"

      compiledCalldata = CallData.toCalldata({
        from_: parsedAccountAddress,
        to: parsedRecipient,
        tokenId: getUint256CalldataFromBN(nft.token_id),
        amount: getUint256CalldataFromBN(1),
        data_len: "0",
      })

      transactions.calldata = compiledCalldata
    }
    const title = `Send ${nft.name}`
    const formattedRecipient = isAddress(recipient)
      ? formatAddress(recipient)
      : recipient
    const subtitle = `to ${formattedRecipient}`
    const hash = await this.trpcMessageClient.transfer.send.mutate({
      transactions,
      title,
      subtitle,
    })

    return hash
  }
}
