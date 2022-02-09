import { FC, useCallback, useEffect, useState } from "react"

import {
  getWhitelist,
  removeFromWhitelist,
} from "../../../background/whitelist"
import { DappListItem } from "./Dapp"
import { SectionHeader } from "./SectionHeader"

export const DappsList: FC = () => {
  const [dappsWhitelist, setDappsWhitelist] = useState<string[]>([])

  const getWhitelistDapps = useCallback(async () => {
    setDappsWhitelist(await getWhitelist())
  }, [])

  useEffect(() => {
    getWhitelistDapps()
  }, [])

  return (
    <>
      <SectionHeader>Dapps</SectionHeader>
      {dappsWhitelist.map((dapp) => (
        <DappListItem
          key={dapp}
          host={dapp}
          onClick={async () => {
            await removeFromWhitelist(dapp)
            getWhitelistDapps()
          }}
        />
      ))}
    </>
  )
}
