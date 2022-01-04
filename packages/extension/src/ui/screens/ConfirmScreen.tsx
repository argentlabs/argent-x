import { FC } from "react"
import styled from "styled-components"

import { ProfilePicture } from "../components/Account/ProfilePicture"
import { Button, ButtonGroupVertical } from "../components/Button"
import { Header } from "../components/Header"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { H2 } from "../components/Typography"
import { getAccountImageUrl } from "../utils/wallet"

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
  selectedAccount?: {
    accountNumber: number
    networkId: string
  }
  port: number
}

interface ConfirmScreenProps extends ConfirmPageProps {
  title: string
  rejectButtonText?: string
  confirmButtonText?: string
  confirmButtonBgColor?: string
  singleButton?: boolean
}

const StickyButtonGroupVertical = styled(ButtonGroupVertical)`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 0 48px;
  background-color: #161616;
`

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  rejectButtonText = "Reject",
  confirmButtonBgColor,
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  children,
  port,
}) => (
  <ConfirmScreenWrapper accountShown={Boolean(selectedAccount)}>
    {selectedAccount && (
      <Header style={{ margin: "0 -32px 16px" }}>
        <ProfilePicture
          src={getAccountImageUrl(selectedAccount.accountNumber)}
          disabled
        />
        <NetworkSwitcher
          networkId={selectedAccount.networkId}
          port={port}
          disabled
        />
      </Header>
    )}
    <H2>{title}</H2>

    {children}

    <StickyButtonGroupVertical
      as="form"
      onSubmit={(e: any) => {
        e.preventDefault()
        return onSubmit?.()
      }}
    >
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
