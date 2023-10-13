import {
  Button,
  CellStack,
  FieldError,
  HeaderCell,
  NavigationContainer,
} from "@argent/ui"
import { Flex, FormControl, Input } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

import { Network } from "../../../../shared/network"

export interface AddNetworkScreenProps {
  requestedNetwork: Network
  onSubmit?: (e: React.FormEvent<HTMLDivElement>) => Promise<void>
  onReject?: () => void
  error?: string
  mode?: "add" | "switch"
  footer?: ReactNode
}

export const AddNetworkScreen: FC<AddNetworkScreenProps> = ({
  requestedNetwork,
  onSubmit,
  onReject,
  error,
  mode = "add",
  footer,
}) => {
  return (
    <NavigationContainer title={`${mode === "add" ? "Add" : "Switch"} Network`}>
      <FormControl
        as="form"
        display={"flex"}
        flexDirection={"column"}
        flex={1}
        onSubmit={onSubmit}
      >
        <CellStack pt={0} flex={1}>
          <HeaderCell>Network ID</HeaderCell>
          <Input isReadOnly value={requestedNetwork.id} />
          <HeaderCell>Name</HeaderCell>
          <Input isReadOnly value={requestedNetwork.name} />
          <HeaderCell>Chain ID</HeaderCell>
          <Input isReadOnly value={requestedNetwork.chainId} />
          <HeaderCell>Base URL</HeaderCell>
          <Input isReadOnly value={requestedNetwork.sequencerUrl} />
          {/*** Show Optional Fields only if the value is provided */}
          {requestedNetwork.explorerUrl && (
            <>
              <HeaderCell>Explorer URL</HeaderCell>
              <Input isReadOnly value={requestedNetwork.explorerUrl} />
            </>
          )}
          {requestedNetwork.blockExplorerUrl && (
            <>
              <HeaderCell>Explorer redirect URL</HeaderCell>
              <Input isReadOnly value={requestedNetwork.blockExplorerUrl} />
            </>
          )}
          {requestedNetwork.rpcUrl && (
            <>
              <HeaderCell>RPC URL</HeaderCell>
              <Input isReadOnly value={requestedNetwork.rpcUrl} />
            </>
          )}
          {error && <FieldError>{error}</FieldError>}
          <Flex flex={1} />
          {footer}
          <Flex gap={1} flex={1}>
            {onReject && (
              <Button onClick={onReject} w="full" data-testid="reject-button">
                Reject
              </Button>
            )}
            <Button
              w="full"
              colorScheme={"primary"}
              type="submit"
              data-testid="submit-button"
            >
              {mode === "add" ? "Add" : "Switch"} Network
            </Button>
          </Flex>
        </CellStack>
      </FormControl>
    </NavigationContainer>
  )
}
