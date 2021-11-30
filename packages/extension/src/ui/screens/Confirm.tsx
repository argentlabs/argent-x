import { FC } from "react"
import styled from "styled-components"

import { Button, ButtonGroupVertical } from "../components/Button"
import { H2 } from "../components/Typography"

const ConfirmScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;

  > form {
    width: 100%;
  }

  > ${H2} {
    margin: 0 0 40px;
  }
`

export interface ConfirmPageProps {
  onSubmit?: () => void
  onReject?: () => void
}

interface ConfirmScreenProps extends ConfirmPageProps {
  title: string
  rejectButtonText?: string
  confirmButtonText?: string
  confirmButtonBgColor?: string
  singleButton?: boolean
}

const StickyButtonGroupVertical = styled(ButtonGroupVertical)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 40px 56px;
  background-color: #161616;
`

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  rejectButtonText = "Reject",
  confirmButtonBgColor,
  onSubmit,
  onReject,
  singleButton = false,
  children,
}) => (
  <ConfirmScreenWrapper>
    <H2>{title}</H2>

    {children}

    <StickyButtonGroupVertical as="form" onSubmit={() => onSubmit?.()}>
      {!singleButton && (
        <Button onClick={onReject} type="button">
          {rejectButtonText}
        </Button>
      )}
      <Button style={{ backgroundColor: confirmButtonBgColor }} type="submit">
        {confirmButtonText}
      </Button>
    </StickyButtonGroupVertical>
  </ConfirmScreenWrapper>
)
