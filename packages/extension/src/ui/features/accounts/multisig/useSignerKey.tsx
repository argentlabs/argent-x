import { utils } from "ethers"
import { useMemo } from "react"

import { usePublicKey } from "../usePublicKey"

export const useSignerKey = () => {
  const pubKey = usePublicKey()

  const encodedPubKey = useMemo(
    () => pubKey && utils.base58.encode(pubKey),
    [pubKey],
  )

  return { encodedPubKey, pubKey }
}
