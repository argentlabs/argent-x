import {
  WarningCircleSecondaryIcon,
  CopyPrimaryIcon,
  RefreshPrimaryIcon,
  BroomIcon,
  DropdownDownIcon,
} from "@argent/x-ui/icons"

import { CellStack, CopyTooltip, H4, P3, useToast } from "@argent/x-ui"
import { scrollbarStyleThin } from "@argent/x-ui/theme"
import type { FC } from "react"
import { useCallback, useEffect, useMemo } from "react"

import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "../hooks/useStorage"
import { coerceErrorToString } from "../../shared/utils/error"
import { useHardResetAndReload } from "../services/resetAndReload"
import type { ErrorBoundaryState } from "./ErrorBoundary"
import { useClearLocalStorage } from "../features/settings/advanced/clearLocalStorage/useClearLocalStorage"
import type { FlexProps } from "@chakra-ui/react"
import {
  Box,
  Button,
  Collapse,
  Flex,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { ClearStorageModal } from "./ClearStorageModal"
import { browserExtensionSentryWithScope } from "../../shared/sentry/scope"

const version = process.env.VERSION
const fallbackErrorPayload = `v${version}

Unable to parse error
`

interface ErrorBoundaryFallbackWithCopyErrorProps
  extends FlexProps,
    ErrorBoundaryState {
  message?: string
  /** overrides storage setting, used in Storybook */
  privacyErrorReporting?: boolean
  errorPayload?: string
}

export const ErrorBoundaryFallbackWithCopyError: FC<
  ErrorBoundaryFallbackWithCopyErrorProps
> = ({
  error,
  errorInfo,
  message = "Sorry, an error occurred",
  privacyErrorReporting: privacyErrorReportingProp,
  errorPayload: errorPayloadProp,
  ...rest
}) => {
  const { isOpen: isErrorOpen, onToggle: onErrorToggle } = useDisclosure()
  const toast = useToast()
  const {
    isOpen: isClearStorageModalOpen,
    onOpen: onClearStorageModalOpen,
    onClose: onClearStorageModalClose,
  } = useDisclosure()

  const hardResetAndReload = useHardResetAndReload()
  const onClearStorageSuccess = async () => {
    await hardResetAndReload()
    onClearStorageModalClose()
  }
  const { verifyPasswordAndClearStorage, isClearingStorage } =
    useClearLocalStorage(onClearStorageSuccess)
  const errorPayload = useMemo(() => {
    try {
      if (errorPayloadProp) {
        return errorPayloadProp
      }
      const displayError = coerceErrorToString(error)
      const displayStack = errorInfo?.componentStack || "No stack trace"
      return `v${version}

${displayError}
${displayStack}
      `
    } catch {
      // ignore error
    }
    return fallbackErrorPayload
  }, [error, errorInfo?.componentStack, errorPayloadProp])

  const reportToSentry = useCallback(
    (manuallySubmitted = true) => {
      browserExtensionSentryWithScope((scope) => {
        try {
          Object.keys(errorInfo).forEach((key) => {
            scope.setExtra(key, errorInfo[key])
          })
        } catch {
          // noop
        }
        scope.setExtra("submittedManually", manuallySubmitted)
        scope.captureException(error)
      })
      if (manuallySubmitted) {
        toast({
          title: "The error was reported successfully",
          status: "success",
          duration: 3000,
        })
      }
    },
    [error, errorInfo, toast],
  )

  const privacyErrorReportingSetting = useKeyValueStorage(
    settingsStore,
    "privacyErrorReporting",
  )

  const privacyErrorReporting =
    privacyErrorReportingProp !== undefined
      ? privacyErrorReportingProp
      : privacyErrorReportingSetting

  const privacyAutomaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  useEffect(() => {
    if (privacyErrorReporting && privacyAutomaticErrorReporting) {
      reportToSentry(false)
    }
  }, [privacyErrorReporting, privacyAutomaticErrorReporting, reportToSentry])

  return (
    <CellStack alignItems="center" textAlign="center" {...rest}>
      <WarningCircleSecondaryIcon color="button-danger" fontSize="6xl" />
      <H4>{message}</H4>
      <Button
        size="2xs"
        colorScheme="transparent"
        color="text-secondary"
        onClick={onErrorToggle}
        rightIcon={<DropdownDownIcon />}
      >
        Show error logs
      </Button>
      <Box w="full">
        <Collapse in={isErrorOpen} animateOpacity>
          <Flex
            overflow="hidden"
            overflowY="auto"
            bg="surface-sunken"
            rounded="lg"
            p={4}
            maxHeight={"80vh"}
            sx={scrollbarStyleThin}
          >
            <P3 as="pre" whiteSpace="pre-wrap" textAlign="left">
              {errorPayload}
            </P3>
          </Flex>
        </Collapse>
      </Box>
      <Flex gap={2}>
        <CopyTooltip copyValue={errorPayload}>
          <Button size="2xs" leftIcon={<CopyPrimaryIcon />}>
            Copy error
          </Button>
        </CopyTooltip>
        <Button
          onClick={() => void hardResetAndReload()}
          size="2xs"
          leftIcon={<RefreshPrimaryIcon />}
        >
          Retry
        </Button>
        <Button
          onClick={() => void onClearStorageModalOpen()}
          size="2xs"
          leftIcon={<BroomIcon />}
        >
          Clear storage
        </Button>
      </Flex>
      <ClearStorageModal
        isOpen={isClearStorageModalOpen}
        onClose={onClearStorageModalClose}
        onConfirm={verifyPasswordAndClearStorage}
        isClearingStorage={isClearingStorage}
      />
      {privacyErrorReporting && (
        <Flex
          mt={2}
          p={3}
          rounded="lg"
          border="1px solid"
          borderColor="surface-elevated-hover"
          gap={2}
          w="full"
          alignItems="center"
          justifyContent="space-between"
        >
          <P3>
            <Text as="span" fontWeight="bold">
              Automatic Error Reporting.{" "}
            </Text>
            <Text as="span" color="text-secondary">
              Be aware that shared logs might contain sensitive data
            </Text>
          </P3>
          <Switch
            isChecked={privacyAutomaticErrorReporting}
            onChange={() =>
              void settingsStore.set(
                "privacyAutomaticErrorReporting",
                !privacyAutomaticErrorReporting,
              )
            }
          />
        </Flex>
      )}
    </CellStack>
  )
}
