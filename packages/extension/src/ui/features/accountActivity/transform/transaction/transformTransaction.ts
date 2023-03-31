import { Token } from "../../../../../shared/token/type"
import { Transaction } from "../../../../../shared/transactions"
import { ActivityTransaction } from "../../useActivity"
import { TransformedTransaction } from "../type"
import changeMultisigThresholdTransformer from "./transformers/changeMultisigThresholdTransformer"
import addMultisigTransformer from "./transformers/changeMultisigTransformer"
import dateTransformer from "./transformers/dateTransformer"
import declareContractTransformer from "./transformers/declareContractTransformer"
import defaultDisplayNameTransformer from "./transformers/defaultDisplayNameTransformer"
import deployContractTransformer from "./transformers/deployContractTransformer"
import guardianTransformer from "./transformers/guardianTransformer"
import knownDappTransformer from "./transformers/knownDappTransformer"
import nftTransferTransformer from "./transformers/nftTransferTransformer"
import postTransferTransformer from "./transformers/postTransferTransformer"
import tokenMintTransformer from "./transformers/tokenMintTransformer"
import tokenTransferTransformer from "./transformers/tokenTransferTransformer"

/** all are executed */
const preTransformers = [
  dateTransformer,
  defaultDisplayNameTransformer,
  knownDappTransformer,
]

/** all are executed until one returns */
const mainTransformers = [
  declareContractTransformer,
  deployContractTransformer,
  nftTransferTransformer,
  tokenMintTransformer,
  tokenTransferTransformer,
  guardianTransformer,
  addMultisigTransformer,
  changeMultisigThresholdTransformer,
]

/** all are executed */
const postTransformers = [postTransferTransformer]

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
  transaction: ActivityTransaction | Transaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
}

export const transformTransaction = ({
  transaction,
  accountAddress,
  tokensByNetwork,
  nftContractAddresses,
}: ITransformExplorerTransaction): TransformedTransaction | undefined => {
  if (!transaction) {
    return
  }
  try {
    let result: TransformedTransaction = {
      action: "UNKNOWN",
      entity: "UNKNOWN",
    }

    for (const { oneOf, transformers } of transformerSequence) {
      for (const transformer of transformers) {
        const transformedResult = transformer({
          transaction,
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
          result,
        })
        if (transformedResult && oneOf) {
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
