import useSWR from "swr"

import {
  IPreAuthorizations,
  getPreAuthorizations,
} from "../../../../shared/preAuthorizations"

export const usePreAuthorizations = () => {
  const { data: preAuthorizations, mutate: refreshPreAuthorizations } =
    useSWR<IPreAuthorizations>("preAuthorizations", getPreAuthorizations, {
      revalidateOnMount: true,
    })
  return {
    preAuthorizations,
    refreshPreAuthorizations,
  }
}
