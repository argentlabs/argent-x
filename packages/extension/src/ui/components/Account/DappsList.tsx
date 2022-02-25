import { FC, useCallback, useEffect, useState } from "react"

import {
  getPreAuthorizations,
  removePreAuthorization,
} from "../../../background/preAuthorizations"
import { DappListItem } from "./Dapp"
import { SectionHeader } from "./SectionHeader"

export const DappsList: FC = () => {
  const [preAuthorizations, setPreAuthorizations] = useState<string[]>([])

  const requestPreAuthorizations = useCallback(async () => {
    setPreAuthorizations(await getPreAuthorizations())
  }, [])

  useEffect(() => {
    requestPreAuthorizations()
  }, [])

  return (
    <>
      <SectionHeader>Dapps</SectionHeader>
      {preAuthorizations.map((dapp) => (
        <DappListItem
          key={dapp}
          host={dapp}
          onClick={async () => {
            await removePreAuthorization(dapp)
            requestPreAuthorizations()
          }}
        />
      ))}
    </>
  )
}
