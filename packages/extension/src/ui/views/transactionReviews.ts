import { atomFamily } from "jotai/utils"
import {
  transactionReviewLabelsStore,
  transactionReviewWarningsStore,
} from "../../shared/transactionReview/store"
import { atomFromKeyValueStore } from "./implementation/atomFromKeyValueStore"
import { atom } from "jotai"
import type { AllowArray } from "../../shared/storage/__new/interface"
import type { ITransactionReviewWarning } from "@argent/x-shared"
import { ensureArray } from "@argent/x-shared"
import { isArray, isEqual, lowerCase, upperFirst } from "lodash-es"

export const allLabelsView = atomFromKeyValueStore(
  transactionReviewLabelsStore,
  "labels",
)

export const labelsFindFamily = atomFamily(
  (key: string) =>
    atom(async (get) => {
      const labels = await get(allLabelsView)
      if (!labels) {
        return
      }
      const label = labels.find((label) => key === label.key)
      return label?.value
    }),
  (a, b) => a === b,
)

export const allWarningsView = atomFromKeyValueStore(
  transactionReviewWarningsStore,
  "warnings",
)

export const warningsFindFamily = atomFamily(
  (key: AllowArray<string>) =>
    atom(async (get) => {
      const warnings = await get(allWarningsView)
      const dictionary: Record<string, ITransactionReviewWarning> = {}
      const keys = ensureArray(key)
      keys.forEach((key) => {
        const warning = warnings?.find((w) => w.reason === key)
        if (warning && warning.title !== undefined) {
          dictionary[key] = warning
        } else {
          // try prettifying the key e.g. multi_route_swap -> Multi route swap
          try {
            dictionary[key] = { reason: key, title: upperFirst(lowerCase(key)) }
          } catch {
            // ignore formatting error
          }
        }
      })
      return isArray(key) ? dictionary : dictionary[key]
    }),
  (a, b) => isEqual(a, b),
)
