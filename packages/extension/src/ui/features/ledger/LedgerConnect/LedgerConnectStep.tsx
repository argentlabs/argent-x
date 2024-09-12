import { FC, useMemo, useState } from "react"
import { ConnectInstructionBox } from "./ConnectInstructionBox"
import { B1 } from "@argent/x-ui"
import { LedgerConnectionError } from "./LedgerConnectionError"
import { useLedgerConnectCallback } from "../hooks/useLedgerConnect"
import { ScreenLayout } from "../layout/ScreenLayout"
import { LedgerConnectSidePanel } from "./LedgerConnectSidePanel"
import { Box } from "@chakra-ui/react"
import { ActionButton } from "../../../components/FullScreenPage"

type ConnectionState = "idle" | "connecting" | "error"

export interface LedgerConnectStepProps {
  onConnect: () => Promise<void> | void
  currentStep: number
  totalSteps?: number
  loading?: boolean
  helpLink?: string
}

export const LedgerConnectStep: FC<LedgerConnectStepProps> = ({
  onConnect,
  currentStep,
  totalSteps,
  loading,
  helpLink,
}) => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle")
  const [connectionError, setConnectionError] = useState<Error>()
  const [hover, setHover] = useState(false)

  const onLedgerConnect = useLedgerConnectCallback()

  const title = useMemo(() => {
    switch (connectionState) {
      case "idle":
        return "Connect your Ledger"
      case "connecting":
        return "Detecting Ledger"
      case "error":
        return "Something went wrong"
    }
  }, [connectionState])

  const buttonLabel = useMemo(() => {
    if (connectionState === "error") {
      return <B1>Retry</B1>
    }
    return <B1>Connect</B1>
  }, [connectionState])

  const subtitle = useMemo(() => {
    return (
      <Box mt="6">
        {connectionState === "error" ? (
          <LedgerConnectionError
            error={connectionError?.message ?? "Unknown Error"}
          />
        ) : (
          <ConnectInstructionBox />
        )}
      </Box>
    )
  }, [connectionError?.message, connectionState])

  const onClick = async () => {
    setConnectionState("connecting")

    try {
      await onLedgerConnect()
      setConnectionState("idle")
      await onConnect()
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        setConnectionError(error)
      }
      setConnectionState("error")
    }
  }

  const isLoading = connectionState === "connecting" || loading

  return (
    <ScreenLayout
      title={title}
      subtitle={subtitle}
      currentIndex={currentStep}
      length={totalSteps}
      sidePanel={
        <LedgerConnectSidePanel
          hover={hover}
          connect={connectionState === "connecting"}
          error={connectionState === "error"}
        />
      }
      helpLink={helpLink}
      filledIndicator
    >
      <ActionButton
        marginTop={{ md: "216px", base: "20px" }}
        isLoading={isLoading}
        disabled={isLoading}
        loadingText={buttonLabel}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {buttonLabel}
      </ActionButton>
    </ScreenLayout>
  )
}
