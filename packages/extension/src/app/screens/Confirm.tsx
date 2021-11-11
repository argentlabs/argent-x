import { FC } from "react"
import styled from "styled-components"

import { Button, ButtonGroupVertical } from "../components/Button"
import { H2 } from "../components/Typography"

const ConfirmScreen = styled.div`
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

interface ConfirmProps extends ConfirmPageProps {
  title: string
  rejectButtonText?: string
  confirmButtonText?: string
}

const StickyButtonGroupVertical = styled(ButtonGroupVertical)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 40px 56px;
  background-color: #161616;
`

export const Confirm: FC<ConfirmProps> = ({
  title,
  confirmButtonText = "Confirm",
  rejectButtonText = "Reject",
  onSubmit,
  onReject,
  children,
}) => {
  return (
    <ConfirmScreen>
      <H2>{title}</H2>

      {children}

      <StickyButtonGroupVertical as="form" onSubmit={() => onSubmit?.()}>
        <Button onClick={onReject} type="button">
          {rejectButtonText}
        </Button>
        <Button type="submit">{confirmButtonText}</Button>
      </StickyButtonGroupVertical>
    </ConfirmScreen>
  )
}
