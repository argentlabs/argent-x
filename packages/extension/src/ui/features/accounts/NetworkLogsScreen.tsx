import { FC, useEffect, useState } from "react"
import styled from "styled-components"

import { NetworkLog } from "./../../../shared/network_log"
import { H2 } from "../../theme/Typography"

export const P = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-top: 16px;
`

export const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 24px 0;

  ${H2} {
    margin: 0 32px 32px 32px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.bg2};
  }
`

export const NetworkLogsScreen: FC = () => {
  const key = "networkLogs"
  const [currentStorage, setStorage] = useState(
    localStorage[key] || JSON.stringify([]),
  )

  useEffect(() => {
    const listener = () => {
      if (localStorage[key] !== currentStorage) {
        setStorage(localStorage[key])
      }
    }

    window.addEventListener("storage", listener)
    return () => window.removeEventListener("storage", listener)
  }, [currentStorage])

  const networkLogs = JSON.parse(currentStorage)

  let count = 0

  const logNodes = networkLogs
    ? networkLogs
        .map((log: NetworkLog) => {
          const key = `log-${count++}`
          return (
            <P key={key}>
              {key} {JSON.stringify(log)}
            </P>
          )
        })
        .reverse()
    : []

  return (
    <div>
      <H2>Argent-X Network Logs</H2>
      {logNodes}
    </div>
  )
}
