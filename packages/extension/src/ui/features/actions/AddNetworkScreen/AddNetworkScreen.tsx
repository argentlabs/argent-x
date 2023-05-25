import { Button, H2, NavigationContainer } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { Network } from "../../../../shared/network"
import { InputText } from "../../../components/InputText"
import { FormError } from "../../accountTokens/SendTokenScreen"

export interface AddNetworkScreenProps {
  requestedNetwork: Network
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  onReject?: () => void
  error?: string
  mode?: "add" | "switch"
}

/** TODO: refactor: should use ConfirmScreen layout and shared UI form components */

export const AddNetworkScreen: FC<AddNetworkScreenProps> = ({
  requestedNetwork,
  onSubmit,
  onReject,
  error,
  mode = "add",
}) => {
  return (
    <NavigationContainer>
      <Box
        display="flex"
        flex={1}
        flexDirection="column"
        paddingTop={0}
        paddingRight={8}
        paddingBottom={12}
        paddingLeft={8}
      >
        <H2>{mode === "add" ? "Add" : "Switch"} Network</H2>

        <form onSubmit={onSubmit}>
          <Box width="100%" display="flex" flexDirection="column" gap={4}>
            {requestedNetwork && (
              <>
                <InputText
                  placeholder="Network ID"
                  type="text"
                  value={requestedNetwork.id}
                  readonly
                />
                <InputText
                  placeholder="Name"
                  type="text"
                  value={requestedNetwork.name}
                  readonly
                />
                <InputText
                  placeholder="Chain ID"
                  type="text"
                  value={requestedNetwork.chainId}
                  readonly
                />
                <InputText
                  placeholder="Base URL"
                  type="text"
                  value={requestedNetwork.baseUrl}
                  readonly
                />
                {/*** Show Optional Fields only if the value is provided */}
                {requestedNetwork.explorerUrl && (
                  <InputText
                    placeholder="Explorer URL"
                    type="text"
                    value={requestedNetwork.explorerUrl}
                    readonly
                  />
                )}
                {requestedNetwork.blockExplorerUrl && (
                  <InputText
                    placeholder="Explorer redirect URL"
                    type="text"
                    value={requestedNetwork.blockExplorerUrl}
                    readonly
                  />
                )}
                {requestedNetwork.rpcUrl && (
                  <InputText
                    placeholder="RPC URL"
                    type="text"
                    value={requestedNetwork.rpcUrl}
                    readonly
                  />
                )}
              </>
            )}
            {error && <FormError>{error}</FormError>}
            <Flex>
              {onReject && (
                <Button
                  onClick={onReject}
                  type="button"
                  marginTop={16}
                  data-testid="reject-button"
                >
                  Reject
                </Button>
              )}
              <Button type="submit" marginTop={16} data-testid="submit-button">
                {mode === "add" ? "Add" : "Switch"} Network
              </Button>
            </Flex>
          </Box>
        </form>
      </Box>
    </NavigationContainer>
  )
}
