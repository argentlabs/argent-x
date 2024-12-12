import { useCallback, useEffect, useState } from "react"
import { accountMessagingService } from "../../../services/accountMessaging"

export const useSeedPhrase = () => {
  const [seedPhrase, setSeedPhrase] = useState<string>()

  const getSeedPhrase = useCallback(
    () => accountMessagingService.getSeedPhrase(),
    [],
  )

  useEffect(() => {
    void getSeedPhrase().then(setSeedPhrase)
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return seedPhrase
}
