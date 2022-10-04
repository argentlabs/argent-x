import { colord } from "colord"
import { FC, useState } from "react"
import Measure from "react-measure"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button, ButtonGroupVertical } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import { H2, P } from "../../theme/Typography"
import { ConfirmPageProps, StickyGroup } from "../actions/ConfirmScreen"
import { recover } from "../recovery/recovery.service"
import { useSelectedAccountStore } from "./accounts.state"
import { useCheckV4UpgradeAvailable } from "./upgrade.service"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 21px;
`

const StyledPBold = styled(StyledP)`
  font-weight: 600;
`

const LearnMoreLink = styled.a`
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;

  color: ${({ theme }) => theme.red3};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const Container = styled.div`
  padding: 12px 32px 32px;
`

const Placeholder = styled.div`
  width: 100%;
  margin-top: 8px;
`

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.white};
  color: black;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) =>
      colord(theme.white).darken(0.1).toRgbString()};
  }
`

interface UpgradeScreenV4Props extends Omit<ConfirmPageProps, "onSubmit"> {
  upgradeType: "account" | "network"
}

export const UpgradeScreenV4: FC<UpgradeScreenV4Props> = ({
  upgradeType,
  onReject,
  ...props
}) => {
  const navigate = useNavigate()
  const { selectedAccount } = useSelectedAccountStore()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)

  const { data: v4UpgradeAvailableOnTestnet } =
    useCheckV4UpgradeAvailable("goerli-alpha")

  const { data: v4UpgradeAvailableOnMainnet } =
    useCheckV4UpgradeAvailable("mainnet-alpha")

  if (!selectedAccount) {
    return <></>
  }

  const openAccountList = async (networkId: string) => {
    navigate(await recover({ networkId, showAccountList: true }))
  }

  return (
    <div {...props}>
      <IconBar
        close
        onClick={() => upgradeType === "account" && onReject && onReject()}
      />
      <Container>
        <H2>
          {upgradeType === "account"
            ? "Account Upgrade Required"
            : "Network Upgrade"}
        </H2>
        {upgradeType === "account" && (
          <StyledPBold>
            You have X days to upgrade your accounts. After that, you won’t be
            able to access your old accounts.
          </StyledPBold>
        )}
        <StyledP>
          StarkNet has released an update to their network with breaking
          changes. As a result we require you to upgrade each of your accounts
          to support these changes
        </StyledP>
        {upgradeType === "network" && (
          <StyledPBold>
            You have X days to upgrade your accounts. After that, you won’t be
            able to access your old accounts.
          </StyledPBold>
        )}

        <LearnMoreLink href="" target="_blank" rel="noreferrer">
          Learn more about this change
        </LearnMoreLink>

        <Placeholder style={{ height: placeholderHeight }}>
          <Measure
            bounds
            onResize={(contentRect) => {
              const { height = 100 } = contentRect.bounds || {}
              setPlaceholderHeight(height)
            }}
          >
            {({ measureRef }) => (
              <StickyGroup ref={measureRef}>
                {upgradeType === "network" ? (
                  <ButtonGroupVertical>
                    {v4UpgradeAvailableOnMainnet && (
                      <PrimaryButton
                        onClick={() => {
                          openAccountList("mainnet-alpha")
                        }}
                        type="button"
                      >
                        Go to mainnet accounts
                      </PrimaryButton>
                    )}
                    {v4UpgradeAvailableOnTestnet &&
                      (v4UpgradeAvailableOnMainnet ? (
                        <Button
                          onClick={() => {
                            openAccountList("goerli-alpha")
                          }}
                          type="button"
                        >
                          Go to testnet accounts
                        </Button>
                      ) : (
                        <PrimaryButton
                          onClick={() => {
                            openAccountList("goerli-alpha")
                          }}
                          type="button"
                        >
                          Go to testnet accounts
                        </PrimaryButton>
                      ))}
                  </ButtonGroupVertical>
                ) : (
                  <PrimaryButton
                    onClick={async () => {
                      onReject ? onReject() : navigate(routes.accountTokens())
                      await upgradeAccount(selectedAccount)
                    }}
                    type="button"
                  >
                    Upgrade Account
                  </PrimaryButton>
                )}
              </StickyGroup>
            )}
          </Measure>
        </Placeholder>
      </Container>
    </div>
  )
}
