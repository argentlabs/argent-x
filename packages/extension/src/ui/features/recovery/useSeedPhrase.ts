import useSWRImmutable from "swr/immutable"

import { getSeedPhrase } from "../../services/messaging"

export const useSeedPhrase = () => {
  // always use useSWRImmutable and not useSWR otherwise the seedphrase will get cached unencrypted in localstorage
  return useSWRImmutable("seedPhrase", getSeedPhrase).data
}
