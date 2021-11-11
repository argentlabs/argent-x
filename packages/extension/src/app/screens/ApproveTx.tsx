import { FC } from "react"
import type { Args } from "starknet"
import styled from "styled-components"

import { P } from "../components/Typography"
import { Confirm, ConfirmPageProps } from "./Confirm"

interface ApproveTxProps extends Omit<ConfirmPageProps, "onSubmit"> {
  tx: { to: string; method: string; calldata: Args }
  onSubmit: (tx: { to: string; method: string; calldata: Args }) => void
}

const Pre = styled.pre`
  margin-top: 24px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  width: 100%;
  overflow: auto;
`

export const ApproveTx: FC<ApproveTxProps> = ({ tx, onSubmit, ...props }) => {
  return (
    <Confirm
      title="Send transaction"
      confirmButtonText="Sign"
      onSubmit={() => {
        onSubmit(tx)
      }}
      {...props}
    >
      <P>Somebody wants to send this transaction in your name:</P>
      <Pre>{JSON.stringify(tx, null, 2)}</Pre>
    </Confirm>
  )
}
