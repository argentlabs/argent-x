import { FC } from "react"
import { Call } from "starknet"
import styled from "styled-components"

import { IExplorerTransactionCall } from "../../../../shared/explorer/type"
import {
  CustomBottomSheet,
  CustomBottomSheetProps,
} from "../../../components/BottomSheet"
import { CopyIconButton } from "../../../components/CopyIconButton"
import Row from "../../../components/Row"
import { scrollbarStyle } from "../../../theme"
import { H3 } from "../../../theme/Typography"
import { Button } from "@chakra-ui/react"

const Container = styled.div`
  padding: 40px 24px 32px;
  gap: 32px;
  justify-content: space-between;
  position: relative;
  display: flex;
  flex-direction: column;
`

const CallDataContainer = styled.pre`
  background-color: ${({ theme }) => theme.black};
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 8px;
  font-weight: normal;
  font-size: 12px;
  line-height: 12px;
  display: flex;
  overflow: scroll;
  max-height: 50vh;
  ${scrollbarStyle}
`

export interface ITransactionCallDataBottomSheet
  extends CustomBottomSheetProps {
  calls?: IExplorerTransactionCall[] | Call[] | Call
}

export const TransactionCallDataBottomSheet: FC<
  ITransactionCallDataBottomSheet
> = ({ calls, onClose, ...rest }) => {
  const displayCalls = JSON.stringify(calls, null, 2)
  return (
    <CustomBottomSheet {...rest} onClose={onClose}>
      <Container>
        <H3>Call data</H3>
        <CallDataContainer>{displayCalls}</CallDataContainer>
        <Row gap="12px">
          <Button onClick={onClose}>Close</Button>
          <CopyIconButton copyValue={displayCalls}>Copy</CopyIconButton>
        </Row>
      </Container>
    </CustomBottomSheet>
  )
}
