import { Button, H6, P3, ScrollContainer } from "@argent/ui"
import { Box, ButtonProps, Flex, ThemingProps, chakra } from "@chakra-ui/react"
import { FC, ReactNode, useState } from "react"
import Measure from "react-measure"
import { useNavigate } from "react-router-dom"

import { formatTruncatedAddress } from "../../services/addresses"
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
  rejectButtonDisabled?: boolean
  confirmButtonBackgroundColor?: ButtonProps["backgroundColor"]
  rejectButtonBackgroundColor?: ButtonProps["backgroundColor"]
  confirmButtonVariant?: ThemingProps<"Button">["variant"]
  rejectButtonVariant?: ThemingProps<"Button">["variant"]
  singleButton?: boolean
  switchButtonOrder?: boolean
  buttonGroup?: "horizontal" | "vertical"
  buttonGap?: string
  showHeader?: boolean
  px?: string
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

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  confirmButtonDisabled,
  confirmButtonBackgroundColor,
  confirmButtonVariant,
  rejectButtonText = "Reject",
  rejectButtonDisabled,
  rejectButtonBackgroundColor,
  rejectButtonVariant,
  buttonGroup = "horizontal",
  buttonGap,
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  switchButtonOrder = false,
  showHeader = true,
  footer,
  children,
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
          pt={accountHeader ? "0" : "18px"}
          px="16px"
          pb="0"
          direction="column"
          gap="2"
        >
          {showHeader && selectedAccount && (
            <Flex
              w="100%"
              justifyContent="center"
              alignItems="center"
              py="18px"
            >
              <H6>{getAccountName(selectedAccount, accountNames)}</H6>&nbsp;
              <P3 color="neutrals.300">
                ({formatTruncatedAddress(selectedAccount.address)})
              </P3>
            </Flex>
          )}
          {children}

          <Box w="full" h={placeholderHeight} />

          <Measure
            bounds
            onResize={(contentRect) => {
              const { height = 100 } = contentRect.bounds || {}
              setPlaceholderHeight(height)
            }}
          >
            {({ measureRef }) => (
              <StickyGroup ref={measureRef} p="4">
                {footer}
                {buttonGroup === "horizontal" && (
                  <Flex
                    flexDirection={switchButtonOrder ? "row-reverse" : "row"}
                    gap={buttonGap || 2}
                    w="full"
                    justifyContent="center"
                  >
                    {!singleButton && (
                      <Button
                        onClick={onReject}
                        type="button"
                        w="full"
                        backgroundColor={
                          !rejectButtonDisabled
                            ? rejectButtonBackgroundColor ?? "neutrals.700"
                            : undefined
                        }
                      >
                        {rejectButtonText}
                      </Button>
                    )}
                    <Button
                      disabled={confirmButtonDisabled}
                      variant={confirmButtonVariant}
                      backgroundColor={
                        !confirmButtonDisabled
                          ? confirmButtonBackgroundColor ?? "primary.500"
                          : undefined
                      }
                      w="full"
                      type="submit"
                    >
                      {confirmButtonText}
                    </Button>
                  </Flex>
                )}

                {buttonGroup === "vertical" && (
                  <Flex
                    flexDirection={
                      switchButtonOrder ? "column-reverse" : "column"
                    }
                  >
                    {!singleButton && (
                      <Button
                        onClick={onReject}
                        type="button"
                        backgroundColor={
                          !rejectButtonDisabled
                            ? rejectButtonBackgroundColor ?? "neutrals.700"
                            : undefined
                        }
                      >
                        {rejectButtonText}
                      </Button>
                    )}
                    <Button
                      disabled={confirmButtonDisabled}
                      backgroundColor={
                        !confirmButtonDisabled
                          ? confirmButtonBackgroundColor ?? "primary.500"
                          : undefined
                      }
                      variant={confirmButtonVariant}
                      type="submit"
                    >
                      {confirmButtonText}
                    </Button>
                  </Flex>
                )}
              </StickyGroup>
            )}
          </Measure>
        </Flex>
      </form>
    </ScrollContainer>
  )
}
