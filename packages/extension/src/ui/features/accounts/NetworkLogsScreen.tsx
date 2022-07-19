import { FC, useState } from "react"
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

function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })
  const setValue = (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue]
}

export const NetworkLogsScreen: FC = () => {
  const [networkLogs] = useLocalStorage("networkLogs", [])

  let count = 0

  const logNodes = networkLogs.map((log: NetworkLog) => {
    const key = `log-${count++}`
    return <P key={key}>{JSON.stringify(log)}</P>
  })

  return (
    <div>
      <H2>Argent-X Network Logs</H2>
      {logNodes}
    </div>
  )
}
