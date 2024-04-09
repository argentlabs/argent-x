import { ScrollContainer } from "@argent/x-ui"
import { Box } from "@chakra-ui/react"
import { FC, ReactNode, useState } from "react"
import Measure from "react-measure"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import {
  Button,
  ButtonGroupHorizontal,
  ButtonGroupVertical,
  ButtonVariant,
} from "../../components/Button"
import { Header } from "../../components/Header"
import { H2 } from "../../theme/Typography"
import { Account } from "../accounts/Account"
import { AccountAvatar } from "../accounts/AccountAvatar"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { NetworkSwitcherContainer } from "../networks/NetworkSwitcher/NetworkSwitcherContainer"

const ConfirmScreenWrapper = styled.form<{
  accountShown: boolean
  smallTopPadding: boolean
}>`
  display: flex;
  flex-direction: column;
  padding: ${({ smallTopPadding }) => (smallTopPadding ? "16px" : "48px")} 32px
    0;
  ${({ accountShown }) => (accountShown ? `padding-top: 0;` : ``)}

  > ${H2} {
    margin: 0 0 40px;
  }
`

export const StickyGroup = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 32px 24px;

  background-color: ${({ theme }) => theme.bg1};
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.4) 0%,
    ${({ theme }) => theme.bg1} 73.72%
  );
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  z-index: 100;

  > * + * {
    margin-top: 24px;
  }
`

const Placeholder = styled.div`
  width: 100%;
  margin-top: 8px;
`

interface DeprecatedConfirmPageProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onReject?: () => void
  selectedAccount?: Account
}

interface DeprecatedConfirmScreenProps extends DeprecatedConfirmPageProps {
  title?: string
  rejectButtonText?: string
  confirmButtonText?: string
  confirmButtonDisabled?: boolean
  confirmButtonBackgroundColor?: string
  confirmButtonVariant?: ButtonVariant
  singleButton?: boolean
  switchButtonOrder?: boolean
  buttonGroup?: "horizontal" | "vertical"
  smallTopPadding?: boolean
  showHeader?: boolean
  footer?: ReactNode
  children: ReactNode
}

/**
 * @deprecated Use ConfirmScreen instead
 */
export const DeprecatedConfirmScreen: FC<DeprecatedConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  confirmButtonDisabled,
  confirmButtonBackgroundColor,
  confirmButtonVariant,
  rejectButtonText = "Reject",
  buttonGroup = "horizontal",
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  switchButtonOrder = false,
  smallTopPadding = false,
  showHeader = true,
  footer,
  children,
  ...props
}) => {
  const navigate = useNavigate()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)
  onReject ??= () => navigate(-1)

  return (
    <ScrollContainer>
      <ConfirmScreenWrapper
        smallTopPadding={smallTopPadding}
        accountShown={Boolean(showHeader && selectedAccount)}
        onSubmit={(e) => {
          e.preventDefault()
          return onSubmit?.(e)
        }}
        {...props}
      >
        {showHeader && selectedAccount && (
          <Header style={{ margin: "0 -32px 16px" }}>
            <AccountAvatar
              src={getAccountImageUrl(selectedAccount.name, selectedAccount)}
            />
            <NetworkSwitcherContainer disabled />
          </Header>
        )}
        {title && (
          <Box pb={10}>
            <H2>{title}</H2>
          </Box>
        )}

        {children}

        <Placeholder
          style={{
            height: placeholderHeight,
          }}
        />

        <Measure
          bounds
          onResize={(contentRect) => {
            const { height = 100 } = contentRect.bounds || {}
            setPlaceholderHeight(height)
          }}
        >
          {({ measureRef }) => (
            <StickyGroup ref={measureRef}>
              {footer}
              {buttonGroup === "horizontal" && (
                <ButtonGroupHorizontal switchButtonOrder={switchButtonOrder}>
                  {!singleButton && (
                    <Button onClick={onReject} type="button">
                      {rejectButtonText}
                    </Button>
                  )}
                  <Button
                    disabled={confirmButtonDisabled}
                    style={{
                      backgroundColor: confirmButtonDisabled
                        ? undefined
                        : confirmButtonBackgroundColor,
                    }}
                    variant={confirmButtonVariant}
                    type="submit"
                  >
                    {confirmButtonText}
                  </Button>
                </ButtonGroupHorizontal>
              )}

              {buttonGroup === "vertical" && (
                <ButtonGroupVertical switchButtonOrder={switchButtonOrder}>
                  {!singleButton && (
                    <Button onClick={onReject} type="button">
                      {rejectButtonText}
                    </Button>
                  )}
                  <Button
                    disabled={confirmButtonDisabled}
                    style={{
                      backgroundColor: confirmButtonDisabled
                        ? undefined
                        : confirmButtonBackgroundColor,
                    }}
                    variant={confirmButtonVariant}
                    type="submit"
                  >
                    {confirmButtonText}
                  </Button>
                </ButtonGroupVertical>
              )}
            </StickyGroup>
          )}
        </Measure>
      </ConfirmScreenWrapper>
    </ScrollContainer>
  )
}
