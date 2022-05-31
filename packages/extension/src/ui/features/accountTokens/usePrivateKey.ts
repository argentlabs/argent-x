import useSWRImmutable from "swr/immutable"

import { getPrivateKey } from "../../services/messaging"

export const usePrivateKey = () =>
  useSWRImmutable("privateKey", getPrivateKey).data
