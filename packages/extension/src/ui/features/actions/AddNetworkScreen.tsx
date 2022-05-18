import React, { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import { number } from "starknet"
import styled from "styled-components"

import { addNetworks } from "../../../background/customNetworks"
import { Network } from "../../../shared/networks"
import { BackButton } from "../../components/BackButton"
import { Button, ButtonGroupVertical } from "../../components/Button"
import { Header } from "../../components/Header"
import { InputText } from "../../components/InputText"
import { FormError, H2 } from "../../components/Typography"
import { routes } from "../../routes"
import { isValidAddress } from "../../services/addresses"
import { TokenDetails } from "../accountTokens/tokens.state"

const AddTokenScreenWrapper = styled.div`
  display: flex;
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
  onSubmit?: () => void
  onReject?: () => void
}

export const AddNetworkScreen: FC<AddNetworkScreenProps> = ({
  requestedNetwork,
  hideBackButton,
  onSubmit,
  onReject,
}) => {
  const navigate = useNavigate()

  const [error, setError] = useState("")

  //   const validAddress = useMemo(() => {
  //     return isValidAddress(networkChainId)
  //   }, [networkChainId])

  //   useEffect(() => {
  //     if (
  //       requestedNetwork &&
  //       requestedNetwork.chainId === networkChainId &&
  //       !tokenDetails
  //     ) {
  //       setLoading(true)
  //     }
  //   }, [requestedNetwork, networkChainId, tokenDetails])

  //   useEffect(() => {
  //     if (account) {
  //       if (loading && account) {
  //         fetchTokenDetails(networkChainId, account)
  //           .then((details) => {
  //             setTokenDetails(details)
  //           })
  //           .catch(() => {
  //             setTokenDetails(undefined)
  //           })
  //           .finally(() => {
  //             setLoading(false)
  //           })
  //       } else if (
  //         isValidAddress(networkChainId) &&
  //         networkChainId !== prevValidAddress.current
  //       ) {
  //         prevValidAddress.current = networkChainId
  //         setLoading(true)
  //       }
  //     }
  //   }, [loading, networkChainId, account])

  //   const compiledData = {
  //     address: networkChainId,
  //     ...(tokenDetails ?? {}),
  //     ...(!tokenDetails?.name && { name: networkName }),
  //     ...(!tokenDetails?.symbol && { symbol: networkBaseUrl }),
  //     ...(!tokenDetails?.decimals && {
  //       decimals: BigNumber.from(networkExplorerUrl || "0"),
  //     }),
  //     networkId: switcherNetworkId,
  //   }

  return (
    <>
      <Header hide={hideBackButton}>
        <BackButton />
      </Header>

      <AddTokenScreenWrapper>
        <H2>Add Network</H2>

        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            if (requestedNetwork) {
              try {
                const networks = addNetworks(requestedNetwork)
                console.log(
                  "🚀 ~ file: AddNetworkScreen.tsx ~ line 139 ~ networks",
                  networks,
                )
                onSubmit?.()
                navigate(routes.settingsNetworks())
              } catch (e) {
                setError("Network already exists")
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
              {requestedNetwork.accountImplementation && (
                <InputText
                  placeholder="Account Implementation Address"
                  type="text"
                  value={requestedNetwork.accountImplementation}
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
          <ButtonGroupVertical>
            {onReject && (
              <Button onClick={onReject} type="button">
                Reject
              </Button>
            )}
            <Button type="submit">Add Network</Button>
          </ButtonGroupVertical>
        </form>
      </AddTokenScreenWrapper>
    </>
  )
}
