import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { transactionReviewLabelsStore } from "../../shared/transactionReview/store"
import { atomFromKeyValueStore } from "./implementation/atomFromKeyValueStore"
import { isArray, isEqual, lowerCase, upperFirst } from "lodash-es"
import { ensureArray } from "@argent/x-shared"

const allLabelsView = atomFromKeyValueStore(
  transactionReviewLabelsStore,
  "labels",
)

export const labelsFindFamily = atomFamily(
  (key: string | string[]) =>
    atom(async (get) => {
      const labels = await get(allLabelsView)
      const dictionary: Record<string, string> = {}
      const keys = ensureArray(key)
      keys.forEach((key) => {
        const label = labels?.find((label) => label.key === key)
        if (label && label.value !== undefined) {
          dictionary[key] = label.value
        } else {
          // try prettifying the key e.g. multi_route_swap -> Multi route swap
          try {
            dictionary[key] = upperFirst(lowerCase(key))
          } catch {
            // ignore formatting error
          }
        }
      })
      return isArray(key) ? dictionary : dictionary[key]
    }),
  (a, b) => isEqual(a, b),
)
