import { Box, BoxProps } from "@chakra-ui/react"
import { FC, useEffect, useMemo } from "react"
import { Fit, Layout, useRive } from "@rive-app/react-canvas"

export interface LedgerConnectSidePanelProps extends BoxProps {
  hover: boolean
  connect: boolean
  error: boolean
}

export const LedgerConnectSidePanel: FC<LedgerConnectSidePanelProps> = ({
  hover,
  connect,
  error,
  ...rest
}) => {
  const { rive, RiveComponent } = useRive({
    src: "./assets/ledger.riv",
    layout: new Layout({ fit: Fit.Contain }),
    autoplay: true,
    stateMachines: "State Machine 1",
  })

  const { hoverInput, connectInput, errorInput } = useMemo(() => {
    const inputs = rive?.stateMachineInputs("State Machine 1")
    const hoverInput = inputs?.find((i) => i.name === "Hover")
    const connectInput = inputs?.find((i) => i.name === "Connect")
    const errorInput = inputs?.find((i) => i.name === "Error")
    return {
      hoverInput,
      connectInput,
      errorInput,
    }
  }, [rive])

  useEffect(() => {
    if (hoverInput) {
      hoverInput.value = hover
    }
  }, [hoverInput, hover])

  useEffect(() => {
    if (connectInput && connect) {
      connectInput.fire()
    }
  }, [connectInput, connect])

  useEffect(() => {
    if (errorInput && error) {
      errorInput.fire()
    }
  }, [errorInput, error])

  return (
    <Box
      width={{ md: "31.25%" }}
      display={{ md: "flex" }}
      height={{ md: "100%" }}
      backgroundColor="black"
      {...rest}
    >
      <RiveComponent />
    </Box>
  )
}
