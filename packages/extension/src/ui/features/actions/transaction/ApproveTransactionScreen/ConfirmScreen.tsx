import {
  Button,
  H6,
  P3,
  ScrollContainer,
  StickyGroup,
  useNavigateBack,
} from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import {
  FC,
  FormEvent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useState,
} from "react"
import Measure, { ContentRect } from "react-measure"

import { formatTruncatedAddress } from "../../../../services/addresses"
import { Account } from "../../../accounts/Account"

export interface ConfirmPageProps {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  onReject?: () => void
  selectedAccount?: Account
}

export interface ConfirmScreenProps
  extends ConfirmPageProps,
    PropsWithChildren {
  title?: string
  rejectButtonText?: string
  confirmButtonText?: string
  confirmButtonDisabled?: boolean
  rejectButtonDisabled?: boolean
  singleButton?: boolean
  switchButtonOrder?: boolean
  showHeader?: boolean
  px?: string
  footer?: ReactNode
  destructive?: boolean
}

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  confirmButtonDisabled,
  rejectButtonText = "Reject",
  rejectButtonDisabled,
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  switchButtonOrder = false,
  showHeader = true,
  footer,
  children,
  destructive,
  ...props
}) => {
  const navigateBack = useNavigateBack()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)
  onReject ??= () => navigateBack()

  const accountHeader = Boolean(selectedAccount && showHeader)

  const onResize = useCallback((contentRect: ContentRect) => {
    const { height = 100 } = contentRect.bounds || {}
    setPlaceholderHeight(height)
  }, [])

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
              <H6>{selectedAccount.name}</H6>
              <P3 color="neutrals.300">
                ({formatTruncatedAddress(selectedAccount.address)})
              </P3>
            </Flex>
          )}
          {children}

          <Box w="full" h={`${placeholderHeight}px`} />

          <Measure bounds onResize={onResize}>
            {({ measureRef }) => (
              <StickyGroup ref={measureRef} p="4">
                {footer}
                <Flex
                  flexDirection={switchButtonOrder ? "row-reverse" : "row"}
                  gap={2}
                  w="full"
                  justifyContent="center"
                >
                  {!singleButton && (
                    <Button
                      onClick={onReject}
                      type="button"
                      w="full"
                      isDisabled={rejectButtonDisabled}
                    >
                      {rejectButtonText}
                    </Button>
                  )}
                  <Button
                    isDisabled={confirmButtonDisabled}
                    colorScheme={destructive ? "danger" : "primary"}
                    w="full"
                    type="submit"
                  >
                    {confirmButtonText}
                  </Button>
                </Flex>
              </StickyGroup>
            )}
          </Measure>
        </Flex>
      </form>
    </ScrollContainer>
  )
}
