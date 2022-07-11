import { FC } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { FormatListBulletedIcon } from "../../components/Icons/MuiIcons"
import { RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import { H2, H3 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenIcon } from "./TokenIcon"
import { TokenMenu } from "./TokenMenu"
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
  color: #ffffff;
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

export const TokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const account = useSelectedAccount()
  const { tokenDetails } = useTokensWithBalance(account)

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  const currencyValue = useTokenBalanceToCurrencyValue(token)

  if (!token) {
    return <Navigate to={routes.accounts()} />
  }

  const { address, name, symbol, balance, image } = toTokenView(token)

  return (
    <>
      <IconBar back childAfter={<TokenMenu tokenAddress={address} />}>
        <H3>{name === "Ether" ? "Ethereum" : name}</H3>
      </IconBar>
      <TokenScreenWrapper>
        <TokenHeader hasCurrencyValue={!!currencyValue}>
          <ColumnCenter>
            <TokenIcon name={name} url={image} large />
            <RowCentered
              gap="8px"
              align="baseline"
              style={{ marginTop: "12px" }}
            >
              <H2 style={{ marginBottom: "0px" }} data-testid="tokenBalance">
                {balance}
              </H2>
              <H3>{symbol}</H3>
            </RowCentered>
            {currencyValue && (
              <CurrencyValueText>{currencyValue}</CurrencyValueText>
            )}
          </ColumnCenter>
        </TokenHeader>
        <ActionContainer>
          <Button
            type="button"
            onClick={() => navigate(routes.sendToken(address))}
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
    </>
  )
}
