import { colord } from "colord"
import { FC, useState } from "react"
import Measure from "react-measure"
import { useLocation, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { useSWRConfig } from "swr"

import { Button, ButtonGroupVertical } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { StarknetIcon } from "../../components/Icons/StarknetIcon"
import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import { H2, P } from "../../theme/Typography"
import {
  ConfirmPageProps,
  StickyGroup,
} from "../actions/transaction/DeprecatedConfirmScreen"
import { useShouldShowNetworkUpgradeMessage } from "../networks/showNetworkUpgrade"
import { recover } from "../recovery/recovery.service"
import { useSelectedAccount } from "./accounts.state"

const StyledIconBar = styled(IconBar)`
  background: url("../../../assets/StarknetStars.png");
  background-color: #18185f;
  padding-bottom: 45px;
`

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

const HeaderText = styled(H2)`
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
`

const Container = styled.div`
  padding: 72px 32px 32px;
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

const IconBarContainer = styled.div`
  position: relative;
`
const StyledStarknetIcon = styled(StarknetIcon)`
  position: absolute;
  top: 60%;
  left: 32px;
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
  const selectedAccount = useSelectedAccount()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)

  const { state } = useLocation()

  const { cache } = useSWRConfig()

  const {
    v4UpgradeAvailableOnTestnet,
    v4UpgradeAvailableOnMainnet,
    v4UpgradeAvailableOnHiddenMainnet,
  } = useShouldShowNetworkUpgradeMessage()

  const removeUpgradeCache = () => {
    cache.delete(["goerli-alpha", false, "v4-upgrade-check"])
    cache.delete(["mainnet-alpha", false, "v4-upgrade-check"])
    cache.delete(["mainnet-alpha", true, "v4-upgrade-check"])
  }

  const openAccountList = async (networkId: string, showHidden = false) => {
    removeUpgradeCache()
    navigate(
      await recover({
        networkId,
        showAccountList: !showHidden,
        showHiddenAccountList: showHidden,
      }),
    )
  }

  const fromAccountTokens = Boolean(
    state && state.from === routes.accountTokens(),
  ) // state can be null

  if (!selectedAccount) {
    return <></>
  }

  return (
    <div {...props}>
      <IconBarContainer>
        <StyledIconBar
          close
          onClick={() => {
            if (upgradeType === "account") {
              return onReject && onReject()
            }

            if (upgradeType === "network") {
              removeUpgradeCache()
            }
          }}
        />
        <StyledStarknetIcon />
      </IconBarContainer>
      <Container>
        <HeaderText>StarkNet is improving</HeaderText>
        {upgradeType === "account" && !fromAccountTokens && (
          <StyledPBold>
            To do this transaction, you need to first upgrade the account.
          </StyledPBold>
        )}
        <StyledP>
          StarkNet has updated their network with important changes. We require
          you to do a simple upgrade of your accounts to support these changes.
        </StyledP>
        {upgradeType === "network" && (
          <StyledPBold>
            Please upgrade your accounts now as they will soon stop working.
          </StyledPBold>
        )}

        <LearnMoreLink
          href="https://medium.com/starkware/starknet-alpha-0-10-0-923007290470"
          target="_blank"
          rel="noreferrer"
        >
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
                    {(v4UpgradeAvailableOnMainnet ||
                      v4UpgradeAvailableOnHiddenMainnet) && (
                      <PrimaryButton
                        onClick={() => {
                          openAccountList(
                            "mainnet-alpha",
                            !v4UpgradeAvailableOnMainnet,
                          )
                        }}
                        type="button"
                      >
                        Go to {!v4UpgradeAvailableOnMainnet ? "hidden " : ""}
                        mainnet accounts
                      </PrimaryButton>
                    )}
                    {v4UpgradeAvailableOnTestnet &&
                      (v4UpgradeAvailableOnMainnet ||
                      v4UpgradeAvailableOnHiddenMainnet ? (
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
                      fromAccountTokens && navigate(routes.accountTokens())
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
