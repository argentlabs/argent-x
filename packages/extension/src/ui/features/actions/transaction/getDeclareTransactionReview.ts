import type { ReviewOfTransaction } from "@argent/x-shared/simulation"
import { hash, type DeclareContractPayload } from "starknet"

export const getDeclareTransactionReview = (
  declareContractPayload: DeclareContractPayload,
  title = "Declare Contract",
): ReviewOfTransaction => {
  const { contract, casm, classHash, compiledClassHash } =
    declareContractPayload

  return {
    assessment: "neutral",
    reviews: [
      {
        assessment: "neutral",
        action: {
          name: title,
          properties: [],
          defaultProperties: [
            {
              type: "class_hash",
              label: "Contract Class Hash",
              classHash: classHash ?? hash.computeContractClassHash(contract),
            },
            {
              type: "class_hash",
              label: "Compiled Class Hash",
              classHash:
                compiledClassHash ??
                (casm ? hash.computeCompiledClassHash(casm) : "0x0"), // Either casm or compiledClassHash WILL be present
            },
            {
              type: "text",
              label: "Contract size",
              text: `${(JSON.stringify(contract).length / 1024).toFixed(2)} KB`,
            },
          ],
        },
      },
    ],
  }
}
