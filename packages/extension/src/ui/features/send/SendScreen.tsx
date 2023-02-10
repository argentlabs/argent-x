import {
  BarBackButton,
  BarCloseButton,
  CellStack,
  NavigationContainer,
} from "@argent/ui"
import { FC, Suspense, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { SearchIcon } from "../../components/Icons/SearchIcon"
import {
  ControlledInputType,
  StyledControlledInput,
} from "../../components/InputText"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { Collection } from "../accountNfts/aspect.model"
import { useCollections } from "../accountNfts/useCollections"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenList } from "../accountTokens/TokenList"
import {
  TokenDetailsWithBalance,
  useTokensInNetwork,
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
  background: ${({ theme, active }) => (active ? theme.bg2 : "transparent")};
  border: 1px solid
    ${({ theme, active }) => (active ? "transparent" : theme.bg2)};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  padding: 6px 12px 8px;
  cursor: pointer;
`

const TabView = styled.div`
  margin: 24px -24px 0;
`

const StyledAccountCollections = styled(AccountCollections)`
  padding-top: 0;
`

type SendAssetTab = "tokens" | "nfts"

export const SendScreen: FC = () => {
  const { control, watch } = useForm({
    defaultValues: { query: "" },
  })

  const account = useSelectedAccount()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<SendAssetTab>("tokens")

  const currentQueryValue = watch().query

  const { switcherNetworkId } = useAppState()
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)

  const tokenList = useCustomTokenList(tokensInNetwork, currentQueryValue)

  const collectibles = useCollections(account)

  const customCollectiblesList = useCustomCollectiblesList(
    collectibles,
    currentQueryValue,
  )

  if (!account) {
    return <></>
  }

  return (
    <NavigationContainer
      leftButton={
        <BarBackButton onClick={() => navigate(routes.accountTokens())} />
      }
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title={"Send"}
    >
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
            NFTs
          </Tab>
        </TabGroup>

        <TabView>
          <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
            {selectedTab === "tokens" && (
              <CellStack pt={0}>
                <TokenList
                  tokenList={tokenList}
                  variant="no-currency"
                  navigateToSend
                  showNewTokenButton
                />
              </CellStack>
            )}

            {selectedTab === "nfts" && (
              <StyledAccountCollections
                account={account}
                withHeader={false}
                customList={customCollectiblesList}
                navigateToSend
              />
            )}
          </Suspense>
        </TabView>
      </Container>
    </NavigationContainer>
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

    const queryLowercase = query.toLowerCase()

    return tokenDetails.filter(
      (token) =>
        token.name.toLowerCase().includes(queryLowercase) ||
        token.address.toLowerCase().includes(queryLowercase) ||
        token.symbol.toLowerCase().includes(queryLowercase),
    )
  }, [query, tokenDetails])
}

const useCustomCollectiblesList = (
  collectibles: Collection[],
  query?: string,
) => {
  return useMemo(() => {
    if (!query) {
      return collectibles
    }

    return collectibles.filter(
      (collectible: Collection) =>
        collectible.name?.includes(query) ||
        collectible.contractAddress.includes(query),
    )
  }, [collectibles, query])
}
