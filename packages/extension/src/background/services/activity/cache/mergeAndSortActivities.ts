import { isEqualAddress } from "@argent/x-shared"
import type { NativeActivity } from "@argent/x-shared/simulation"
import {
  NativeActivityTypeNative,
  type AnyActivity,
} from "@argent/x-shared/simulation"

import { mergeArrayStableWith } from "../../../../shared/storage/__new/base"

const options = {
  compareFn(a: AnyActivity, b: AnyActivity) {
    return isEqualAddress(a.transaction.hash, b.transaction.hash)
  },
  mergeFn(a: AnyActivity, b: AnyActivity) {
    if (a.type === NativeActivityTypeNative) {
      if (b.type === NativeActivityTypeNative) {
        /** replace one locally created with another */
        return b
      }
      /** don't replace locally created meta icon etc., but do maybe use the title, status, fees and transfer summary */
      const merged: NativeActivity = {
        ...a,
      }
      /** merge in title if native doesn't have one */
      if (b.title && !merged.meta?.title) {
        if (!merged.meta) {
          merged.meta = {}
        }
        merged.meta.title = b.title
      }
      /** merge in fees since a native tx won't have it  */
      if (b.fees) {
        merged.fees = b.fees
      }
      /** only override 'success' since other states may lag behind local state  */
      if (b.status === "success") {
        merged.status = b.status
      }
      /** more up to date than the original simulation  */
      if (b.transferSummary) {
        merged.transferSummary = b.transferSummary
      }
      if (b.multisigDetails) {
        merged.multisigDetails = b.multisigDetails
      }
      if (b.actions) {
        merged.actions = b.actions
      }
      return merged
    }

    return b
  },
}

export function sortActivities(merged: Array<AnyActivity>) {
  const sorted = merged.sort((a, b) => b.submitted - a.submitted)
  return sorted
}

export function mergeAndSortActivities(
  source: Array<AnyActivity> = [],
  other: Array<AnyActivity> = [],
): AnyActivity[] {
  const merged = mergeArrayStableWith(source, other, options)
  const sorted = sortActivities(merged)
  return sorted
}
