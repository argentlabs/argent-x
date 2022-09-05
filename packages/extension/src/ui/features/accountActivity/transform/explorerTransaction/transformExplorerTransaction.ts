import { IExplorerTransaction } from "../../../../../shared/explorer/type"
import { Token } from "../../../../../shared/token/type"
import { TransformedTransaction } from "../type"
import { fingerprintExplorerTransaction } from "./fingerprintExplorerTransaction"
import accountCreateTransformer from "./transformers/accountCreateTransformer"
import accountUpgradeTransformer from "./transformers/accountUpgradeTransformer"
import dappAlphaRoadSwapTransformer from "./transformers/dappAlphaRoadSwapTransformer"
import dappAspectBuyNFTTransformer from "./transformers/dappAspectBuyNFTTransformer"
import dappInfluenceMintTransformer from "./transformers/dappInfluenceMintTransformer"
import dappJediswapSwapTransformer from "./transformers/dappJediswapSwapTransformer"
import dappMintSquareBuyNFTTransformer from "./transformers/dappMintSquareBuyNFTTransformer"
import dappMySwapSwapTransformer from "./transformers/dappMySwapSwapTransformer"
import dateTransformer from "./transformers/dateTransformer"
import defaultDisplayNameTransformer from "./transformers/defaultDisplayNameTransformer"
import feesTransformer from "./transformers/feesTransformer"
import knownDappTransformer from "./transformers/knownDappTransformer"
import nftMintTransformer from "./transformers/nftMintTransformer"
import nftTransferTransformer from "./transformers/nftTransferTransformer"
import postSwapTransformer from "./transformers/postSwapTransformer"
import postTransferTransformer from "./transformers/postTransferTransformer"
import tokenMintTransformer from "./transformers/tokenMintTransformer"
import tokenTransferTransformer from "./transformers/tokenTransferTransformer"

/** all are executed */
const preTransformers = [
  dateTransformer,
  defaultDisplayNameTransformer,
  feesTransformer,
  knownDappTransformer,
]

/** all are executed until one returns */
const mainTransformers = [
  accountCreateTransformer,
  accountUpgradeTransformer,
  dappAlphaRoadSwapTransformer,
  dappAspectBuyNFTTransformer,
  dappInfluenceMintTransformer,
  dappJediswapSwapTransformer,
  dappMintSquareBuyNFTTransformer,
  dappMySwapSwapTransformer,
  nftMintTransformer,
  nftTransferTransformer,
  tokenMintTransformer,
  tokenTransferTransformer,
]

/** all are executed */
const postTransformers = [postTransferTransformer, postSwapTransformer]

/** describes the sequence and which are exclusive */
const transformerDefinitions = [
  {
    exclusive: false,
    transformers: preTransformers,
  },
  {
    exclusive: true,
    transformers: mainTransformers,
  },
  {
    exclusive: false,
    transformers: postTransformers,
  },
]

export interface ITransformExplorerTransaction {
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
}

/**
 *
 * Takes an explorer transaction {@link ITransformExplorerTransaction}
 * and passes it through the transformers defined above
 *
 * The result includes rich information about the transaction {@link TransformedTransaction}
 *
 * @returns the transformation result, or undefined if transformation failed
 *
 */

export const transformExplorerTransaction = ({
  explorerTransaction,
  accountAddress,
  tokensByNetwork,
}: ITransformExplorerTransaction): TransformedTransaction | undefined => {
  if (!explorerTransaction) {
    return
  }
  try {
    let result: TransformedTransaction = {
      action: "UNKNOWN",
      entity: "UNKNOWN",
    }

    const fingerprint = fingerprintExplorerTransaction(explorerTransaction)

    for (const { exclusive, transformers } of transformerDefinitions) {
      for (const transformer of transformers) {
        const transformedResult = transformer({
          explorerTransaction,
          accountAddress,
          tokensByNetwork,
          result,
          fingerprint,
        })
        if (transformedResult && exclusive) {
          /** only take a single result from this set */
          result = transformedResult
          continue
        } else {
          result = {
            ...result,
            ...transformedResult,
          }
        }
      }
    }
    return result
  } catch (e) {
    // don't throw on parsing error, UI will fallback to default
  }
}
