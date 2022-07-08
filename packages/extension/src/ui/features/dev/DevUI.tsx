import { FC, useCallback } from "react"
import styled from "styled-components"
import browser from "webextension-polyfill"

import { RowCentered } from "../../components/Row"
import { useBackupRequired } from "../recovery/backupDownload.state"

const Container = styled(RowCentered)`
  position: fixed;
  z-index: 123;
`

const DevButton = styled.div`
  background-color: rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 500px;
  margin-top: 4px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
`

const DevUI: FC = () => {
  const reset = useCallback(() => {
    // reset cache
    const backupState = useBackupRequired.getState()
    localStorage.clear()
    useBackupRequired.setState(backupState)
  }, [])
  const onReload = useCallback(() => {
    const url = browser.runtime.getURL("index.html")
    setTimeout(() => {
      // ensure state got persisted before reloading
      window.location.href = url
    }, 100)
  }, [])
  return (
    <Container gap={"4px"}>
      <DevButton onClick={reset}>Reset cache</DevButton>
      <DevButton onClick={onReload}>Reload</DevButton>
    </Container>
  )
}

export default DevUI
