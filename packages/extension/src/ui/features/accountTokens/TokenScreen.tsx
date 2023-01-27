import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, useMemo } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../shared/token/price"
import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { FormatListBulletedIcon } from "../../components/Icons/MuiIcons"
import { LoadingPulse } from "../../components/LoadingPulse"
import { RowCentered } from "../../components/Row"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { H3 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenIcon } from "./TokenIcon"
import { TokenMenuDeprecated } from "./TokenMenuDeprecated"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { toTokenView } from "./tokens.service"
import { useTokensWithBalance } from "./tokens.state"

const TokenScreenWrapper = styled(ColumnCenter)`
  width: 100%;
`

const TokenHeader = styled(RowCentered)<{ hasCurrencyValue: boolean }>`
  width: 100%;
  flex: 1;
  background-color: #000000;
  padding: ${({ hasCurrencyValue }) => (hasCurrencyValue ? "28px" : "42px")};
`
const ActionContainer = styled(ColumnCenter)`
  width: 100%;
  flex: 2;
  padding: 24px;
  gap: 84px;
`

const CurrencyValueText = styled.div`
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  margin-top: 8px;
`

const ActivityIconWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 14.5px;
  border-radius: 50%;
`

const ActivityText = styled.div`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  color: ${({ theme }) => theme.text4};
`

const ComingSoonText = styled.div`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: ${({ theme }) => theme.text3};
`

const TokenBalanceContainer = styled(RowCentered)`
  gap: 8px;
  margin-top: 12px;
  align-items: baseline;
`

export const TokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const account = useSelectedAccount()
  const { tokenDetails, tokenDetailsIsInitialising, isValidating } =
    useTokensWithBalance(account)
  const token = useMemo(
    () => tokenDetails.find(({ address }) => address === tokenAddress),
    [tokenAddress, tokenDetails],
  )
  const currencyValue = useTokenBalanceToCurrencyValue(token)
  const returnTo = useCurrentPathnameWithQuery()

  if (!token) {
    return <Navigate to={routes.accountTokens()} />
  }

  const { address, name, symbol, image } = toTokenView(token)
  const displayBalance = prettifyTokenBalance(token, false)
  const isLoading = isValidating || tokenDetailsIsInitialising

  return (
    <NavigationContainer
      leftButton={
        <BarBackButton onClick={() => navigate(routes.accountTokens())} />
      }
      rightButton={<TokenMenuDeprecated tokenAddress={address} />}
      title={name === "Ether" ? "Ethereum" : name}
    >
      <TokenScreenWrapper>
        <TokenHeader hasCurrencyValue={!!currencyValue}>
          <ColumnCenter>
            <TokenIcon name={name} url={image} size={12} />
            <TokenBalanceContainer>
              <LoadingPulse
                isLoading={isLoading}
                display="flex"
                alignItems="center"
                gap="2"
              >
                <H3
                  data-testid={
                    isLoading ? "tokenBalanceIsLoading" : "tokenBalance"
                  }
                >
                  {displayBalance}
                </H3>
                <H3>{symbol}</H3>
              </LoadingPulse>
            </TokenBalanceContainer>
            {currencyValue && (
              <CurrencyValueText>
                {prettifyCurrencyValue(currencyValue)}
              </CurrencyValueText>
            )}
          </ColumnCenter>
        </TokenHeader>
        <ActionContainer>
          <Button
            type="button"
            onClick={() => navigate(routes.sendToken(address, returnTo))}
          >
            Send
          </Button>

          <ColumnCenter gap="12px">
            <ActivityIconWrapper>
              <FormatListBulletedIcon />
            </ActivityIconWrapper>
            <ColumnCenter>
              <ActivityText>Activity</ActivityText>
              <ComingSoonText>Coming Soon</ComingSoonText>
            </ColumnCenter>
          </ColumnCenter>
        </ActionContainer>
      </TokenScreenWrapper>
    </NavigationContainer>
  )
}
