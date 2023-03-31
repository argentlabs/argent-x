import { BarBackButton, BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { AccountAddress, AccountName } from "../../components/Address"
import { CopyIconButton } from "../../components/CopyIconButton"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import { formatFullAddress, normalizeAddress } from "../../services/addresses"
import { usePageTracking } from "../../services/analytics"
import { useSelectedAccount } from "../accounts/accounts.state"
import { QrCode } from "./QrCode"

const Container = styled.div`
  padding: 0 20px;
  text-align: center;
`

const StyledCopyIconButton = styled(CopyIconButton)`
  margin-top: 16px;
  width: auto;
`

export const FundingQrCodeScreen: FC = () => {
  const navigate = useNavigate()
  const addressRef = useRef<HTMLParagraphElement | null>(null)
  const account = useSelectedAccount()
  usePageTracking("addFundsFromOtherAccount", {
    networkId: account?.networkId || "unknown",
  })
  const copyAccountAddress = account ? normalizeAddress(account.address) : ""

  /** Intercept 'copy' event and replace fragmented address with plain text address */
  const onCopyAddress = useCallback(
    (e: ClipboardEvent) => {
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", copyAccountAddress)
        e.preventDefault()
      }
    },
    [copyAccountAddress],
  )

  /** Intercept 'mouseup' and automatically select the entire address */
  const onSelectAddress = useCallback((_e: Event) => {
    const selection = window.getSelection()
    if (selection && addressRef.current) {
      selection.setBaseAndExtent(addressRef.current, 0, addressRef.current, 1)
    }
  }, [])

  /** Add / remove events when ref changes */
  const setAddressRef = useCallback(
    (ref: HTMLParagraphElement) => {
      if (addressRef.current) {
        addressRef.current.removeEventListener("copy", onCopyAddress)
        addressRef.current.removeEventListener("mouseup", onSelectAddress)
      }
      addressRef.current = ref
      if (addressRef.current) {
        addressRef.current.addEventListener("copy", onCopyAddress)
        addressRef.current.addEventListener("mouseup", onSelectAddress)
      }
    },
    [onCopyAddress, onSelectAddress],
  )

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      <PageWrapper>
        {account && (
          <Container>
            <QrCode size={220} data={account?.address} />
            <AccountName>{account.name}</AccountName>
            <AccountAddress
              ref={setAddressRef}
              aria-label="Full account address"
            >
              {formatFullAddress(account.address)}
            </AccountAddress>
            <StyledCopyIconButton size="s" copyValue={copyAccountAddress}>
              Copy address
            </StyledCopyIconButton>
          </Container>
        )}
      </PageWrapper>
    </NavigationContainer>
  )
}
