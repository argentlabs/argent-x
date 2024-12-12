import {
  BarBackButton,
  CellStack,
  Empty,
  icons,
  NavigationContainer,
  P3,
  SegmentedButtons,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import { partition } from "lodash-es"
import type { FC, ReactEventHandler } from "react"
import { useMemo, useState } from "react"
import type { TokenWithBalanceAndPrice } from "../../../shared/token/__new/types/tokenPrice.model"
import { sortTokensByPrice } from "../../views/tokenPrices"
import { HideTokenListItem } from "./HideTokenListItem"
import { useView } from "../../views/implementation/react"
import { defiDecompositionTokensViewAtom } from "../../views/investments"
import { selectedAccountView } from "../../views/account"
import { equalToken } from "../../../shared/token/__new/utils"

const { InfoCircleSecondaryIcon, CheckmarkSecondaryIcon } = icons

interface HiddenAndSpamSettingsScreenProps {
  onBack: ReactEventHandler
  tokens: TokenWithBalanceAndPrice[]
  onToggleHiddenFlag: (token: TokenWithBalanceAndPrice) => Promise<void>
}

export const HiddenAndSpamTokensScreen: FC<
  HiddenAndSpamSettingsScreenProps
> = ({ onBack, tokens, onToggleHiddenFlag }) => {
  const [spamTokens, nonSpamTokens] = partition(tokens, (t) =>
    t.tags?.includes("scam"),
  )
  const [isTokensTab, setIsTokensTab] = useState(true)
  const account = useView(selectedAccountView)
  const tokensInDefiDecomposition = useView(
    defiDecompositionTokensViewAtom(account),
  )

  const displayedTokens = useMemo(() => {
    const unfilteredTokens = isTokensTab ? nonSpamTokens : spamTokens
    const filteredTokens = unfilteredTokens.filter(
      (token) =>
        (token.showAlways || token.custom || token?.balance > 0n) &&
        !tokensInDefiDecomposition?.some((t) => equalToken(t, token)),
    )

    const sortedTokens = sortTokensByPrice(filteredTokens)

    const [alwaysVisible, others] = partition(sortedTokens, (t) => t.showAlways)

    return [...alwaysVisible, ...others]
  }, [isTokensTab, nonSpamTokens, spamTokens, tokensInDefiDecomposition])

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Hidden and spam tokens"}
    >
      <CellStack pt={0} flex={1}>
        <SegmentedButtons
          options={["Tokens", "Spam"]}
          onSelectionChange={(index: number) => setIsTokensTab(index === 0)}
          mb="3"
        />

        {!isTokensTab && (
          <Flex
            borderRadius="lg"
            border="1px solid"
            borderColor="white.30"
            alignItems="center"
            background="black"
            p="3"
            mb="3"
            gap="2"
          >
            <InfoCircleSecondaryIcon
              color="neutrals.200"
              h={"18px"}
              w={"18px"}
            />
            <P3 color="neutrals.200">
              Spam tokens are automatically hidden by Argent
            </P3>
          </Flex>
        )}

        {displayedTokens.map((token, index) => {
          return (
            <HideTokenListItem
              key={index}
              token={token}
              onToggleHide={() => void onToggleHiddenFlag(token)}
            />
          )
        })}

        {displayedTokens.length === 0 && (
          <Center flex={1} flexDirection={"column"} color={"text-subtle"}>
            <Empty
              icon={<CheckmarkSecondaryIcon />}
              title={`No ${isTokensTab ? "" : "spam"} tokens`}
            />
          </Center>
        )}
      </CellStack>
    </NavigationContainer>
  )
}
