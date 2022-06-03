import useSWRImmutable from "swr/immutable"

import { getSeedPhrase } from "../../services/backgroundAccounts"

export const useSeedPhrase = () =>
  // always use useSWRImmutable and not useSWR otherwise the seedphrase will get cached unencrypted in localstorage
  useSWRImmutable("seedPhrase", getSeedPhrase).data
