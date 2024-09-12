import { H5, P3, P4, iconsDeprecated } from "@argent/x-ui"
import {
  Button,
  Center,
  CenterProps,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { FC, ReactEventHandler, ReactNode, useMemo } from "react"

import LedgerNanoConnected from "./assets/ledger-nano-connected.svg"
import LedgerNanoDisconnected from "./assets/ledger-nano-disconnected.svg"
import { upperFirst } from "lodash-es"

const { AlertIcon, CloseIcon } = iconsDeprecated

export enum LedgerModalBottomDialogState {
  CONFIRM = "CONFIRM",
  NOT_CONNECTED = "NOT_CONNECTED",
  INVALID_APP = "INVALID_APP",
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
}

export const LedgerModalBottomDialog: FC<LedgerModalBottomDialogProps> = ({
  state,
  errorMessage,
  children,
  onRetry,
  actionType = "transaction",
  txHash,
  ...rest
}) => {
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
            tooltip={txHash && <TxHashTooltip txHash={txHash} />}
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
            icon={<AlertIcon />}
            title={"There is already another signature pending"}
            subtitle={
              "You need to clear that signature before you can confirm this transaction"
            }
          />
        )
      case LedgerModalBottomDialogState.ERROR_REJECTED:
        return (
          <LedgerModalContent
            icon={<CloseIcon />}
            title={`${upperFirst(actionType)} rejected`}
            subtitle={`${upperFirst(actionType)} rejected on your Ledger`}
            onRetry={onRetry}
          />
        )
      case LedgerModalBottomDialogState.ERROR:
        return (
          <LedgerModalContent
            icon={<AlertIcon />}
            title={"An error occurred"}
            subtitle={errorMessage}
            onRetry={onRetry}
          />
        )
    }
    state satisfies never
  }, [actionType, errorMessage, onRetry, state, txHash])

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
    <Tooltip label={txHash} aria-label="Transaction hash">
      <P4 color="text-secondary" mt={1}>
        {`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}
      </P4>
    </Tooltip>
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
      {title && <H5>{title}</H5>}
      {tooltip}
      {subtitle && (
        <P3 color="text-secondary" mt={2}>
          {subtitle}
        </P3>
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

import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerProps,
  Flex,
  useModalContext,
} from "@chakra-ui/react"

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
      <CloseIcon />
    </Button>
  )
}
