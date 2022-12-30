import { FC, useState } from "react"
import styled from "styled-components"

import { Network, networkSchema } from "../../../shared/network"
import { assertSchema } from "../../../shared/utils/schema"
import { BackButton } from "../../components/BackButton"
import { Button, ButtonGroupHorizontal } from "../../components/Button"
import { Header } from "../../components/Header"
import { InputText } from "../../components/InputText"
import { FormError, H2 } from "../../theme/Typography"

const AddTokenScreenWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 32px 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`

interface AddNetworkScreenProps {
  requestedNetwork: Network
  hideBackButton?: boolean
  onSubmit?: () => Promise<void>
  onReject?: () => void
  mode?: "add" | "switch"
}

export const AddNetworkScreen: FC<AddNetworkScreenProps> = ({
  requestedNetwork,
  hideBackButton,
  onSubmit,
  onReject,
  mode = "add",
}) => {
  const [error, setError] = useState("")

  return (
    <>
      <Header hide={hideBackButton}>
        <BackButton />
      </Header>

      <AddTokenScreenWrapper>
        <H2>{mode === "add" ? "Add" : "Switch"} Network</H2>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              await assertSchema(networkSchema, requestedNetwork)
              await onSubmit?.()
            } catch (error) {
              if (error instanceof Error) {
                setError(error.message)
              } else {
                setError(`${error}`)
              }
            }
          }}
        >
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
          <ButtonGroupHorizontal>
            {onReject && (
              <Button onClick={onReject} type="button">
                Reject
              </Button>
            )}
            <Button type="submit">
              {mode === "add" ? "Add" : "Switch"} Network
            </Button>
          </ButtonGroupHorizontal>
        </form>
      </AddTokenScreenWrapper>
    </>
  )
}
