import { FC } from "react"
import styled from "styled-components"

import { P } from "../components/Typography"
import { Confirm, ConfirmPageProps } from "./Confirm"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

export const DisclaimerScreen: FC<ConfirmPageProps> = (props) => {
  return (
    <Confirm
      title="Disclaimer"
      confirmButtonText="I understand"
      confirmButtonBgColor="#fe4d4d"
      singleButton
      {...props}
    >
      <SP>
        This is an alpha product for developers. Future versions will include
        breaking changes and you will likely lose access to your accounts. Do
        not store valuable assets.
      </SP>
    </Confirm>
  )
}
