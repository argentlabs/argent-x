import { FC, FormEvent, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Account } from "../Account"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { Button, ButtonGroupVertical } from "../components/Button"
import { Header } from "../components/Header"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { H2 } from "../components/Typography"
import { getAccountName, useAccountMetadata } from "../states/accountMetadata"
import { getAccountImageUrl } from "../utils/accounts"

const ConfirmScreenWrapper = styled.div<{ accountShown: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 48px 32px 0;
  ${({ accountShown }) => (accountShown ? `padding-top: 0;` : ``)}

  > ${H2} {
    margin: 0 0 40px;
  }
`

export interface ConfirmPageProps {
  onSubmit?: () => void
  onReject?: () => void
  selectedAccount?: Account
}

interface ConfirmScreenProps extends ConfirmPageProps {
  title: string
  rejectButtonText?: string
  confirmButtonText?: string
  disableConfirm?: boolean
  confirmButtonBackgroundColor?: string
  singleButton?: boolean
  footer?: ReactNode
}

const StickyGroup = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 0 24px;

  > * + * {
    margin-top: 24px;
  }
`

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  disableConfirm = false,
  rejectButtonText = "Reject",
  confirmButtonBackgroundColor,
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  footer,
  children,
}) => {
  const navigate = useNavigate()
  const { accountNames } = useAccountMetadata()
  onReject ??= () => navigate(-1)

  return (
    <ConfirmScreenWrapper accountShown={Boolean(selectedAccount)}>
      {selectedAccount && (
        <Header style={{ margin: "0 -32px 16px" }}>
          <ProfilePicture
            src={getAccountImageUrl(
              getAccountName(selectedAccount, accountNames),
              selectedAccount.address,
            )}
            disabled
          />
          <NetworkSwitcher disabled />
        </Header>
      )}
      <H2>{title}</H2>

      {children}
      <StickyGroup>
        {footer}
        <ButtonGroupVertical
          as="form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            return onSubmit?.()
          }}
        >
          {!singleButton && (
            <Button onClick={onReject} type="button">
              {rejectButtonText}
            </Button>
          )}
          <Button
            disabled={disableConfirm}
            style={{ backgroundColor: confirmButtonBackgroundColor }}
            type="submit"
          >
            {confirmButtonText}
          </Button>
        </ButtonGroupVertical>
      </StickyGroup>
    </ConfirmScreenWrapper>
  )
}
