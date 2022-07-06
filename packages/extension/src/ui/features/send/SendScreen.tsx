import { FC, Suspense, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { AddIcon } from "../../components/Icons/MuiIcons"
import { SearchIcon } from "../../components/Icons/SearchIcon"
import {
  ControlledInputType,
  StyledControlledInput,
} from "../../components/InputText"
import { Spinner } from "../../components/Spinner"
import { H3 } from "../../components/Typography"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { useSelectedAccount } from "../accounts/accounts.state"
import { AddTokenIconButton } from "../accountTokens/AccountTokens"
import { TokenList } from "../accountTokens/TokenList"
import { TokenTitle, TokenWrapper } from "../accountTokens/TokenListItem"
import {
  TokenDetailsWithBalance,
  useTokensWithBalance,
} from "../accountTokens/tokens.state"

const SearchBox = styled.form`
  margin-top: 8px;
`

const StyledInput: ControlledInputType = styled(StyledControlledInput)`
  padding: 16px;
  padding-left: 41px;
`

const InputBefore = styled.div`
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 24px;
`

const TabGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`

const Tab = styled.div<{ active: boolean }>`
  background: ${({ active }) => (active ? "#333332" : "transparent")};
  border: 1px solid ${({ active }) => (active ? "transparent" : "#333332")};
  color: ${({ active }) => (active ? "#ffffff" : "#8F8E8C")};
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  padding: 6px 12px 8px;
  cursor: pointer;
`

const TabView = styled.div`
  margin: 32px -24px 0;
`

type SendAssetTab = "tokens" | "nfts"

export const SendScreen: FC = () => {
  const { control, watch } = useForm({
    defaultValues: { query: "" },
  })

  const navigate = useNavigate()

  const account = useSelectedAccount()

  const [selectedTab, setSelectedTab] = useState<SendAssetTab>("tokens")

  const currentQueryValue = watch().query

  const { tokenDetails, isValidating } = useTokensWithBalance(account)

  const tokenList = useCustomTokenList(tokenDetails, currentQueryValue)

  if (!account) {
    return <></>
  }

  return (
    <>
      <IconBar close back>
        <H3>Send</H3>
      </IconBar>

      <Container>
        <SearchBox>
          <StyledInput
            autoComplete="off"
            name="query"
            placeholder="Search"
            type="text"
            control={control}
            autoFocus
          >
            <InputBefore>
              <SearchIcon />
            </InputBefore>
          </StyledInput>
        </SearchBox>

        <TabGroup>
          <Tab
            active={selectedTab === "tokens"}
            onClick={() => setSelectedTab("tokens")}
          >
            Tokens
          </Tab>
          <Tab
            active={selectedTab === "nfts"}
            onClick={() => setSelectedTab("nfts")}
          >
            Collectibles
          </Tab>
        </TabGroup>

        <TabView>
          <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
            {selectedTab === "tokens" ? (
              <>
                <TokenList
                  variant="no-currency"
                  isValidating={isValidating}
                  tokenList={tokenList}
                  showTokenSymbol
                />
                <TokenWrapper
                  {...makeClickable(() => navigate(routes.newToken()))}
                >
                  <AddTokenIconButton size={40}>
                    <AddIcon />
                  </AddTokenIconButton>
                  <TokenTitle>Add token</TokenTitle>
                </TokenWrapper>
              </>
            ) : (
              <div></div>
            )}
          </Suspense>
        </TabView>
      </Container>
    </>
  )
}

const useCustomTokenList = (
  tokenDetails: TokenDetailsWithBalance[],
  query?: string,
) => {
  return useMemo(() => {
    if (!query) {
      return tokenDetails
    }

    return tokenDetails.filter(
      (token) =>
        token.name.includes(query) ||
        token.address.includes(query) ||
        token.symbol.includes(query),
    )
  }, [query, tokenDetails])
}
