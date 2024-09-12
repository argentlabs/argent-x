import {
  Button,
  H6,
  P3,
  ScrollContainer,
  StickyGroup,
  useNavigateBack,
  iconsDeprecated,
} from "@argent/x-ui"
import { Box, Flex, Tooltip } from "@chakra-ui/react"
import {
  FC,
  FormEvent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react"
import Measure, { ContentRect } from "react-measure"

import { WalletAccount } from "../../../../../shared/wallet.model"
import { formatTruncatedAddress } from "@argent/x-shared"

const { LockIcon } = iconsDeprecated

export interface ConfirmPageProps {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  onReject?: () => void
  selectedAccount?: WalletAccount
}

export interface ConfirmScreenProps
  extends ConfirmPageProps,
    PropsWithChildren {
  title?: string
  rejectButtonText?: string
  confirmButtonText?: string
  confirmButtonIsLoading?: boolean
  confirmButtonLoadingText?: string
  confirmButtonDisabled?: boolean
  rejectButtonDisabled?: boolean
  useRejectButtonColorFallback?: boolean
  singleButton?: boolean
  switchButtonOrder?: boolean
  showHeader?: boolean
  showConfirmButton?: boolean
  px?: string
  footer?: ReactNode
  destructive?: boolean
  navigationBar?: ReactNode
  hideFooter?: boolean
  isLedger?: boolean
  header?: ReactNode
}

export const ConfirmScreen: FC<ConfirmScreenProps> = ({
  title,
  confirmButtonText = "Confirm",
  confirmButtonDisabled,
  confirmButtonIsLoading,
  confirmButtonLoadingText = "Confirm",
  rejectButtonText = "Reject",
  rejectButtonDisabled,
  useRejectButtonColorFallback = true,
  onSubmit,
  onReject,
  selectedAccount,
  singleButton = false,
  switchButtonOrder = false,
  showHeader = true,
  showConfirmButton = true,
  hideFooter = false,
  footer,
  children,
  destructive,
  navigationBar,
  isLedger,
  header,
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

  const confirmLeftIcon = useMemo(() => {
    if (!isLedger) {
      return
    }

    return <LockIcon />
  }, [isLedger])

  const ConfirmButtonContainer = useCallback(
    ({ children }: { children: ReactNode }) => {
      if (isLedger) {
        return (
          <Tooltip
            label="Sign on your Ledger"
            maxW={{ base: "156px", md: "auto" }}
          >
            {children}
          </Tooltip>
        )
      }

      return <>{children}</>
    },
    [isLedger],
  )

  return (
    <>
      {navigationBar}
      <ScrollContainer>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            return onSubmit?.(e)
          }}
          {...props}
        >
          {header}
          <Flex
            pt={accountHeader || navigationBar ? "0" : "18px"}
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
                <H6 mr={2}>{selectedAccount.name}</H6>
                <P3 color="neutrals.300">
                  ({formatTruncatedAddress(selectedAccount.address)})
                </P3>
              </Flex>
            )}
            {children}

            <Box w="full" h={`${placeholderHeight}px`} />

            {!hideFooter && (
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
                          colorScheme={
                            useRejectButtonColorFallback
                              ? !showConfirmButton
                                ? "primary"
                                : undefined
                              : undefined
                          }
                          sx={{
                            pointerEvents: "auto !important",
                          }}
                        >
                          {rejectButtonText}
                        </Button>
                      )}
                      {showConfirmButton && (
                        <ConfirmButtonContainer>
                          <Button
                            id={confirmButtonText}
                            isDisabled={confirmButtonDisabled}
                            colorScheme={destructive ? "danger" : "primary"}
                            w="full"
                            type="submit"
                            isLoading={confirmButtonIsLoading}
                            loadingText={confirmButtonLoadingText}
                            sx={{
                              pointerEvents: "auto !important",
                            }}
                            leftIcon={confirmLeftIcon}
                          >
                            {confirmButtonText}
                          </Button>
                        </ConfirmButtonContainer>
                      )}
                    </Flex>
                  </StickyGroup>
                )}
              </Measure>
            )}
          </Flex>
        </form>
      </ScrollContainer>
    </>
  )
}
