import { FC } from "react"
import styled from "styled-components"

import { RowCentered } from "../../components/Row"
import {
  useHardReload,
  useResetCache,
  useSoftReload,
} from "../../services/resetAndReload"

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
  const resetCache = useResetCache()
  const softReload = useSoftReload()
  const hardReload = useHardReload()
  return (
    <Container gap={"4px"}>
      <DevButton onClick={resetCache}>Reset cache</DevButton>
      <DevButton onClick={softReload}>Reload UI</DevButton>
      <DevButton onClick={hardReload}>Reload HTML</DevButton>
    </Container>
  )
}

export default DevUI
