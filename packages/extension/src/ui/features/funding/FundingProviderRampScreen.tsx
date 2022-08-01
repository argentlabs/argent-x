import { FC, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IS_DEV } from "../../../shared/utils/dev"
import { getBaseUrlForHost } from "../../../shared/utils/host"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { useSelectedAccount } from "../accounts/accounts.state"

const LOGO_URL = `https://www.argent.xyz/icons/icon-512x512.png`
const RAMP_BASE_URL = "https://buy.ramp.network/"

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`

const LoadingContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg1};
`

const RampIFrame = styled.iframe`
  border: none;
`

export const FundingProviderRampScreen: FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseCreated, setPurchaseCreated] = useState(false)
  const account = useSelectedAccount()
  const normalizedAddress = (account && normalizeAddress(account.address)) || ""

  const params: Record<string, string> = {
    hostApiKey: process.env.RAMP_API_KEY as string,
    hostAppName: "Argent X",
    hostLogoUrl: LOGO_URL,
    swapAsset: "STARKNET_*",
    userAddress: normalizedAddress,
    variant: "mobile",
  }

  const searchParams = new URLSearchParams(params)

  const src = `${RAMP_BASE_URL}?${searchParams}`

  const messageEventListener = useCallback(
    (event: any) => {
      if (!event.data) {
        return
      }

      /** ensure message is from the Ramp iframe */
      try {
        if (
          getBaseUrlForHost(event.origin) !== getBaseUrlForHost(RAMP_BASE_URL)
        ) {
          return
        }
      } catch (e) {
        // ignore parsing error
        return
      }

      /** @see https://docs.ramp.network/events */
      switch (event.data.type) {
        case "WIDGET_CONFIG_DONE":
          setIsLoading(false)
          break
        case "WIDGET_CONFIG_FAILED":
          setIsLoading(false)
          break
        case "PURCHASE_CREATED":
          setPurchaseCreated(true)
          break
        case "WIDGET_CLOSE":
          if (purchaseCreated) {
            navigate(routes.accountTokens())
          } else {
            navigate(-1)
          }
          break
      }
    },
    [navigate, purchaseCreated],
  )

  useEffect(() => {
    window.addEventListener("message", messageEventListener)
    return () => {
      window.removeEventListener("message", messageEventListener)
    }
  }, [messageEventListener])

  return (
    <Container>
      {isLoading && (
        <LoadingContainer>
          <Spinner size={64} />
        </LoadingContainer>
      )}
      <RampIFrame
        src={src}
        width="100%"
        height="100%"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </Container>
  )
}
