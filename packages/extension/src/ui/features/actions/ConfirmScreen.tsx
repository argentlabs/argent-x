import { H6, P3, ScrollContainer } from "@argent/ui"
import { Box, Flex, chakra } from "@chakra-ui/react"
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
import { formatTruncatedAddress } from "../../services/addresses"
import { H2 } from "../../theme/Typography"
import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"

export interface ConfirmPageProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onReject?: () => void
  selectedAccount?: Account
}

interface ConfirmScreenProps extends ConfirmPageProps {
  title?: string
  rejectButtonText?: string
  confirmButtonText?: string
  confirmButtonDisabled?: boolean
  confirmButtonBackgroundColor?: string
  confirmButtonVariant?: ButtonVariant
  singleButton?: boolean
  switchButtonOrder?: boolean
  buttonGroup?: "horizontal" | "vertical"
  buttonGap?: string
  smallTopPadding?: boolean
  showHeader?: boolean
  px?: string
  stickyGroupPadding?: string
  footer?: ReactNode
  children: ReactNode
}

export const StickyGroup = chakra(Box, {
  baseStyle: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // padding: "16px 32px 24px",
    background:
      "linear-gradient(180deg, rgba(16, 16, 20, 0) 0%, #101014 66.54%)",
    zIndex: 100,

    "& > * + *": { marginTop: "24px" },
  },
})

const Placeholder = styled.div`
  width: 100%;
  margin-top: 8px;
`

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  confirmButtonDisabled,
  confirmButtonBackgroundColor,
  confirmButtonVariant,
  rejectButtonText = "Reject",
  buttonGroup = "horizontal",
  buttonGap,
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  switchButtonOrder = false,
  smallTopPadding = false,
  showHeader = true,
  footer,
  children,
  px,
  stickyGroupPadding,
  ...props
}) => {
  const navigate = useNavigate()
  const { accountNames } = useAccountMetadata()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)
  onReject ??= () => navigate(-1)

  const accountHeader = Boolean(selectedAccount && showHeader)

  return (
    <ScrollContainer>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          return onSubmit?.(e)
        }}
        {...props}
      >
        <Flex
          pt={smallTopPadding || accountHeader ? "18px" : 12}
          px={px || "8"}
          pb="0"
          direction="column"
          gap="2"
        >
          {showHeader && selectedAccount && (
            <Flex w="100%" justifyContent="center" alignItems="center" pb="1">
              <H6>{getAccountName(selectedAccount, accountNames)}</H6>&nbsp;
              <P3>({formatTruncatedAddress(selectedAccount.address)})</P3>
            </Flex>
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
              <StickyGroup
                ref={measureRef}
                padding={stickyGroupPadding || "16px 32px 24px"}
              >
                {footer}
                {buttonGroup === "horizontal" && (
                  <ButtonGroupHorizontal
                    switchButtonOrder={switchButtonOrder}
                    buttonGap={buttonGap}
                  >
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
        </Flex>
      </form>
    </ScrollContainer>
  )
}
