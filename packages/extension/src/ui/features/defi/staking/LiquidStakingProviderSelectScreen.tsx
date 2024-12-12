import {
  BarCloseButton,
  CellStack,
  logos,
  Empty,
  H5,
  icons,
  L2,
  NavigationContainer,
  P4,
} from "@argent/x-ui"
import { Flex, Square } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo } from "react"

import { CustomButtonCell } from "../../../components/CustomButtonCell"

const {
  ArrowUpRightPrimaryIcon,
  SearchPrimaryIcon,
  AddressBookIcon,
  InfoCircleSecondaryIcon,
} = icons

const { DappsEndurfiLogo } = logos

interface LiquidStakingProviderSelectScreenProps {
  onBack: () => void
}

type StaticInvestment = {
  title: string
  logo: React.ReactNode
  token: string
  dappUrl: string
}

const StaticInvestments: StaticInvestment[] = [
  {
    title: "Endur Liquid STRK Staking",
    logo: <DappsEndurfiLogo w="full" h="full" />, // TODO: replace with Endur logo once available
    token: "xSTRK",
    dappUrl: "https://app.endur.fi/?referrer=1BCXD",
  },
]

export const LiquidStakingProviderSelectScreen: FC<
  LiquidStakingProviderSelectScreenProps
> = ({ onBack }) => {
  const investments = StaticInvestments
  const hasInvestments = Boolean(investments.length)

  const onProviderSelect = useCallback((provider: StaticInvestment) => {
    window.open(provider.dappUrl, "_blank")
  }, [])

  const content = useMemo(() => {
    if (!hasInvestments) {
      return <Empty icon={<AddressBookIcon />} title={`No providers`} />
    }

    return (
      <CellStack pt="0" flex={1}>
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
            color="text-secondary"
            width={4}
            height={4}
          />
          <L2 color="text-secondary-web" width="full">
            Liquid staking on Starknet has additional risks compared to native
            staking. Please do your own research to understand the risks.
          </L2>
        </Flex>
        {hasInvestments ? (
          <Flex
            gap={1}
            justifyContent="space-between"
            alignItems="baseline"
            color="text-secondary"
            mx={0}
            mt={2}
          >
            <H5>Provider</H5>
          </Flex>
        ) : (
          <Empty icon={<SearchPrimaryIcon />} title={`No matching providers`} />
        )}
        {investments.map((provider, index) => (
          <CustomButtonCell
            key={index}
            onClick={() => onProviderSelect(provider)}
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center" gap={2}>
              <Square
                size={10}
                rounded="md"
                bg="surface-elevated-hover"
                color="text-secondary"
                position="relative"
                overflow="hidden"
              >
                {provider.logo}
              </Square>
              <Flex
                grow={1}
                direction="column"
                justifySelf="flex-start"
                gap={0.5}
              >
                <H5>{provider.title}</H5>
                <P4 color="text-secondary">{provider.token}</P4>
              </Flex>
            </Flex>
            <ArrowUpRightPrimaryIcon width={4} height={4} />
          </CustomButtonCell>
        ))}
      </CellStack>
    )
  }, [hasInvestments, investments, onProviderSelect])

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={onBack} />}
      title={"Select a provider"}
    >
      {content}
    </NavigationContainer>
  )
}
