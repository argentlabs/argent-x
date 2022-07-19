import { FC } from "react"
import styled from "styled-components"

import { NetworkLog } from "./../../../shared/network_log"
import { H2 } from "../../theme/Typography"
import { useNetworkLogs } from "./../settings/networkLogs.state"

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
  const [networkLogs] = useNetworkLogs()
  let count = 0

  const logNodes = networkLogs.map((log: NetworkLog) => {
    const key = `log-${count++}`
    return (
      <P key={key}>
        {log.method} {log.url} {log.headers} {log.body}
      </P>
    )
  })

  return (
    <div>
      <H2>Argent-X Network Logs</H2>
      {logNodes}
    </div>
  )
}
