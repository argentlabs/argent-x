import {
  Button,
  CellStack,
  FieldError,
  HeaderCell,
  NavigationContainer,
} from "@argent/x-ui"
import { Flex, FormControl, Input } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"

import type { Network } from "../../../shared/network"

export interface AddNetworkScreenProps {
  requestedNetwork: Network
  onSubmit?: (e: React.FormEvent<HTMLDivElement>) => Promise<void>
  onReject?: () => void
  error?: string
  footer?: ReactNode
}

export const AddNetworkScreen: FC<AddNetworkScreenProps> = ({
  requestedNetwork,
  onSubmit,
  onReject,
  error,
  footer,
}) => {
  return (
    <NavigationContainer title={`Add Network`}>
      <FormControl
        as="form"
        display={"flex"}
        flexDirection={"column"}
        flex={1}
        onSubmit={(e) => {
          if (onSubmit) {
            void onSubmit(e)
          }
        }}
      >
        <CellStack pt={0} flex={1}>
          <HeaderCell>Network ID</HeaderCell>
          <Input isReadOnly value={requestedNetwork.id} />
          <HeaderCell>Name</HeaderCell>
          <Input isReadOnly value={requestedNetwork.name} />
          <HeaderCell>Chain ID</HeaderCell>
          <Input isReadOnly value={requestedNetwork.chainId} />
          <HeaderCell>RPC URL</HeaderCell>
          <Input isReadOnly value={requestedNetwork.rpcUrl} />
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
              Add Network
            </Button>
          </Flex>
        </CellStack>
      </FormControl>
    </NavigationContainer>
  )
}
