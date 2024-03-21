import {
  BarCloseButton,
  CellStack,
  Empty,
  NavigationContainer,
  icons,
} from "@argent/x-ui"
import {
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react"
import { FC } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { TokenList } from "../accountTokens/TokenList"
import { useSendQuery } from "./schema"
import { useFilteredCollections } from "./useFilteredCollections"
import { useFilteredTokens } from "./useFilteredTokens"

const { SearchIcon, WalletIcon, NftIcon } = icons

export const SendAssetScreen: FC = () => {
  const { recipientAddress, tokenId, amount, returnTo } = useSendQuery()
  const navigate = useNavigate()
  const account = useView(selectedAccountView)
  const { watch, register } = useForm({
    defaultValues: { query: "" },
  })
  const query = watch().query
  const { ref, ...rest } = register("query")
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  const { filteredTokens } = useFilteredTokens(query)
  const { filteredCollections } = useFilteredCollections(query)

  if (!account) {
    return null
  }

  const hasTokens = filteredTokens.length > 0
  const hasCollections = filteredCollections.length > 0
  const hasQuery = Boolean(query)

  const defaultTabIndex = tokenId !== undefined ? 1 : 0

  return (
    <NavigationContainer
      rightButton={<BarCloseButton />}
      title={"Select an asset"}
    >
      <CellStack pt={0} flex={1}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon />
          </InputLeftElement>
          <Input
            {...rest}
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            value={query}
            autoComplete="off"
            placeholder="Search"
            type="text"
          />
        </InputGroup>

        <Tabs
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          defaultIndex={defaultTabIndex}
          mt={4}
        >
          <TabList>
            <Tab>Tokens</Tab>
            <Tab>NFTs</Tab>
          </TabList>
          <TabPanels flex={1} display={"flex"} flexDirection={"column"}>
            <TabPanel flex={1} display={"flex"} flexDirection={"column"}>
              {hasTokens ? (
                <CellStack px={0} pt={2}>
                  <TokenList
                    tokenList={filteredTokens}
                    variant="no-currency"
                    onItemClick={(token) =>
                      navigate(
                        routes.sendAmountAndAssetScreen({
                          tokenAddress: token.address,
                          recipientAddress,
                          amount,
                          returnTo,
                        }),
                      )
                    }
                    showNewTokenButton
                  />
                </CellStack>
              ) : (
                <Empty
                  icon={hasQuery ? <SearchIcon /> : <WalletIcon />}
                  title={hasQuery ? `No matching tokens` : `No tokens`}
                />
              )}
            </TabPanel>
            <TabPanel flex={1} display={"flex"} flexDirection={"column"}>
              {hasCollections ? (
                <AccountCollections
                  networkId={account.networkId}
                  collections={filteredCollections}
                  px={0}
                  pt={2}
                  onCollectionClick={(collection) =>
                    navigate(
                      routes.sendCollectionsNftsScreen({
                        tokenAddress: collection.contractAddress,
                        recipientAddress,
                        returnTo,
                      }),
                    )
                  }
                />
              ) : (
                <Empty
                  icon={hasQuery ? <SearchIcon /> : <NftIcon />}
                  title={hasQuery ? `No matching NFTs` : `No NFTs`}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CellStack>
    </NavigationContainer>
  )
}
