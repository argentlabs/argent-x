import { NftItem } from "@argent/x-shared"
import { Network } from "../../../shared/network"

export interface IClientNftService {
  transferNft(
    network: Network,
    nft: NftItem,
    accountAddress: string,
    recipient: string,
  ): Promise<string>
}
