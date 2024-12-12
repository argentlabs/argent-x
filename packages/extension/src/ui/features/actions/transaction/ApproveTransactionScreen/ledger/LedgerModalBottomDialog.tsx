import { CopyTooltip, H4, icons, L1Bold, P2, P3 } from "@argent/x-ui"
import type { CenterProps } from "@chakra-ui/react"
import { Button, Center, HStack, Spinner, Text, VStack } from "@chakra-ui/react"
import type { FC, ReactEventHandler, ReactNode } from "react"
import { useMemo } from "react"

import LedgerNanoConnected from "./assets/ledger-nano-connected.svg"
import LedgerNanoDisconnected from "./assets/ledger-nano-disconnected.svg"
import { upperFirst } from "lodash-es"

export enum LedgerModalBottomDialogState {
  CONFIRM = "CONFIRM",
  NOT_CONNECTED = "NOT_CONNECTED",
  INVALID_APP = "INVALID_APP",
  UNSUPPORTED_APP_VERSION = "UNSUPPORTED_APP_VERSION",
  ERROR_UNKNOWN = "ERROR_UNKNOWN",
  ERROR_SIGNATURE_PENDING = "ERROR_SIGNATURE_PENDING",
  ERROR_REJECTED = "ERROR_REJECTED",
  ERROR = "ERROR",
}

export interface LedgerModalBottomDialogProps
  extends Omit<ModalBottomDialogProps, "children"> {
  state: LedgerModalBottomDialogState
  errorMessage?: string
  children?: ReactNode
  onRetry?: ReactEventHandler
  actionType?: "transaction" | "signature"
  txHash?: string | null
  deployTxHash?: string | null
}

export const LedgerModalBottomDialog: FC<LedgerModalBottomDialogProps> = ({
  state,
  errorMessage,
  children,
  onRetry,
  actionType = "transaction",
  txHash,
  deployTxHash,
  ...rest
}) => {
  const tooltip = useMemo(() => {
    if (txHash && deployTxHash) {
      return (
        <CombinedTxHashTooltip txHash={txHash} deployTxHash={deployTxHash} />
      )
    } else if (txHash) {
      return <TxHashTooltip txHash={txHash} />
    }

    return null
  }, [deployTxHash, txHash])

  const content = useMemo(() => {
    switch (state) {
      case LedgerModalBottomDialogState.CONFIRM:
        return (
          <LedgerModalContent
            image={<LedgerNanoConnected />}
            title={
              <>
                Confirm on Ledger <Spinner size={"sm"} ml={1} />
              </>
            }
            tooltip={tooltip}
            subtitle={
              "Please confirm this transaction using your Ledger device"
            }
          />
        )
      case LedgerModalBottomDialogState.NOT_CONNECTED:
        return (
          <LedgerModalContent
            image={<LedgerNanoDisconnected />}
            title={"Ledger not connected"}
            subtitle={
              "Please make sure your Ledger is unlocked and the Starknet app is opened"
            }
          />
        )

      case LedgerModalBottomDialogState.INVALID_APP:
        return (
          <LedgerModalContent
            image={<LedgerNanoConnected />}
            title={"Unsupported Ledger app"}
            subtitle={"Please make sure the Starknet app is opened"}
          />
        )

      case LedgerModalBottomDialogState.UNSUPPORTED_APP_VERSION:
        return (
          <LedgerModalContent
            icon={<WarningCircleSecondaryIcon />}
            title={"Update required"}
            subtitle={errorMessage}
          />
        )

      case LedgerModalBottomDialogState.ERROR_UNKNOWN:
        return (
          <LedgerModalContent
            image={<LedgerNanoConnected />}
            title={"Something went wrong"}
            subtitle={
              "Please make sure your Ledger is unlocked and the Starknet app is opened"
            }
          />
        )
      case LedgerModalBottomDialogState.ERROR_SIGNATURE_PENDING:
        return (
          <LedgerModalContent
            icon={<WarningCircleSecondaryIcon />}
            title={"There is already another signature pending"}
            subtitle={
              "You need to clear that signature before you can confirm this transaction"
            }
          />
        )
      case LedgerModalBottomDialogState.ERROR_REJECTED:
        return (
          <LedgerModalContent
            icon={<CrossSecondaryIcon />}
            title={`${upperFirst(actionType)} rejected`}
            subtitle={`${upperFirst(actionType)} rejected on your Ledger`}
            onRetry={onRetry}
          />
        )
      case LedgerModalBottomDialogState.ERROR:
        return (
          <LedgerModalContent
            icon={<WarningCircleSecondaryIcon />}
            title={"An error occurred"}
            subtitle={errorMessage}
            onRetry={onRetry}
          />
        )
    }
    state satisfies never
  }, [actionType, errorMessage, onRetry, state, tooltip])

  const disableCloseButton = state === LedgerModalBottomDialogState.CONFIRM

  return (
    <ModalBottomDialog
      disableCloseButton={disableCloseButton}
      closeOnOverlayClick={!disableCloseButton}
      closeOnEsc={!disableCloseButton}
      {...rest}
    >
      {content}
      {children}
    </ModalBottomDialog>
  )
}

const TxHashTooltip: FC<{ txHash: string }> = ({ txHash }) => {
  return (
    <CopyTooltip
      copyValue={txHash}
      prompt={txHash}
      aria-label="Transaction hash"
    >
      <P3 color="text-secondary" mt={1}>
        {`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}
      </P3>
    </CopyTooltip>
  )
}

const CombinedTxHashTooltip: FC<{ txHash: string; deployTxHash: string }> = ({
  txHash,
  deployTxHash,
}) => {
  return (
    <VStack spacing={1} mt={1}>
      <HStack align="baseline" gap="0.5">
        <L1Bold>Deploy:</L1Bold>
        <TxHashTooltip txHash={deployTxHash} />
      </HStack>
      <HStack align="baseline" gap="0.5">
        <L1Bold>Transaction: </L1Bold>
        <TxHashTooltip txHash={txHash} />
      </HStack>
    </VStack>
  )
}

interface LedgerModalContentProps extends Omit<CenterProps, "title"> {
  image?: ReactNode
  icon?: ReactNode
  title?: ReactNode
  tooltip?: ReactNode
  subtitle?: ReactNode
  onRetry?: ReactEventHandler
}

function LedgerModalContent({
  image,
  icon,
  title,
  tooltip,
  subtitle,
  onRetry,
  children,
  ...rest
}: LedgerModalContentProps) {
  return (
    <Center flexDirection="column" textAlign="center" {...rest}>
      {image && (
        <Center mt={4} mb={6}>
          {image}
        </Center>
      )}
      {icon && (
        <Text color="text-danger" fontSize={"48px"} mb={4}>
          {icon}
        </Text>
      )}
      {title && <H4>{title}</H4>}
      {tooltip}
      {subtitle && (
        <P2 color="text-secondary" mt={2}>
          {subtitle}
        </P2>
      )}
      {onRetry && (
        <Button bg="neutrals.600" mt={4} onClick={onRetry} w="full">
          Retry
        </Button>
      )}
      {children}
    </Center>
  )
}

// =============================================================================
// TODO: Make this part of x-ui after latest release
// =============================================================================

import type { DrawerProps } from "@chakra-ui/react"
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useModalContext,
} from "@chakra-ui/react"

const { WarningCircleSecondaryIcon, CrossSecondaryIcon } = icons

export interface ModalBottomDialogProps extends DrawerProps {
  disableCloseButton?: boolean
}

export const ModalBottomDialog: FC<ModalBottomDialogProps> = ({
  children,
  placement = "bottom",
  disableCloseButton = false,
  ...rest
}) => {
  return (
    <Drawer placement={placement} {...rest}>
      <DrawerOverlay bg="black.50" />
      <DrawerContent
        p={4}
        alignItems="center"
        bg="transparent"
        boxShadow="initial"
      >
        <Flex
          color="text-primary"
          bg="surface-elevated"
          rounded="3xl"
          width="full"
          maxWidth="30rem"
          alignItems="center"
          flexDirection="column"
          boxShadow="menu"
        >
          <Flex w="full" px={3} pt={3}>
            {!disableCloseButton && <ModalCloseButton />}
          </Flex>
          <Flex direction="column" w="full" px={5} pb={5}>
            {children}
          </Flex>
        </Flex>
      </DrawerContent>
    </Drawer>
  )
}

export const ModalCloseButton: FC = () => {
  const { onClose } = useModalContext()
  return (
    <Button
      data-testid="close-button"
      ml="auto"
      colorScheme="transparent"
      size="auto"
      color="black.50"
      fontSize="2xs"
      minWidth={5}
      minHeight={5}
      onClick={onClose}
      _dark={{
        color: "white.50",
      }}
    >
      <CrossSecondaryIcon />
    </Button>
  )
}
