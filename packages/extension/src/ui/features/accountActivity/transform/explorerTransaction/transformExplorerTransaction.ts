import { IExplorerTransaction } from "../../../../../shared/explorer/type"
import { Token } from "../../../../../shared/token/__new/types/token.model"
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
import knownNftTransformer from "./transformers/knownNftTransformer"
import postSwapTransformer from "./transformers/postSwapTransformer"
import postTransferTransformer from "./transformers/postTransferTransformer"
import provisionTransformer from "./transformers/provisionTransformer"
import tokenApproveTransformer from "./transformers/tokenApproveTransformer"
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

// TODO: add declare ad deploy contract transformers after backend update
const mainTransformers = [
  accountCreateTransformer,
  accountUpgradeTransformer,
  dappAlphaRoadSwapTransformer,
  dappAspectBuyNFTTransformer,
  dappInfluenceMintTransformer,
  dappJediswapSwapTransformer,
  dappMintSquareBuyNFTTransformer,
  dappMySwapSwapTransformer,
  knownNftTransformer,
  tokenMintTransformer,
  tokenTransferTransformer,
  tokenApproveTransformer,
  provisionTransformer,
]

/** all are executed */
const postTransformers = [postTransferTransformer, postSwapTransformer]

/** describes the sequence and which are 'one of' */
const transformerSequence = [
  {
    oneOf: false,
    transformers: preTransformers,
  },
  {
    oneOf: true,
    transformers: mainTransformers,
  },
  {
    oneOf: false,
    transformers: postTransformers,
  },
]

export interface ITransformExplorerTransaction {
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
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
  nftContractAddresses,
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

    for (const { oneOf, transformers } of transformerSequence) {
      for (const transformer of transformers) {
        const transformedResult = transformer({
          explorerTransaction,
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
          result,
          fingerprint,
        })
        if (transformedResult && oneOf) {
          /** only take a single result from this set */
          result = transformedResult
          break
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
