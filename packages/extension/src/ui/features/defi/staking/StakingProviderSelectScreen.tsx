import type {
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"
import {
  bigDecimal,
  prettifyCurrencyNumber,
  prettifyCurrencyValue,
} from "@argent/x-shared"
import {
  SearchPrimaryIcon,
  AddressBookIcon,
  NoImageSecondaryIcon,
} from "@argent/x-ui/icons"
import {
  BarCloseButton,
  CellStack,
  Empty,
  H5,
  L1,
  NavigationContainer,
  P4,
} from "@argent/x-ui"
import {
  Flex,
  Image,
  InputGroup,
  InputLeftElement,
  Square,
  Input,
} from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { CustomButtonCell } from "../../../components/CustomButtonCell"
import { ListSkeleton } from "../../../components/ScreenSkeleton"
import { useAutoFocusInputRef } from "../../../hooks/useAutoFocusInputRef"
import { useView } from "../../../views/implementation/react"
import { knownDappsWithIds } from "../../../views/knownDapps"

interface StakingProviderSelectScreenProps {
  investments?: StrkDelegatedStakingInvestment[] | LiquidStakingInvestment[]
  onInvestmentClick: (
    investment: StrkDelegatedStakingInvestment | LiquidStakingInvestment,
  ) => void
  onBack: () => void
  isLoading: boolean
}

export const StakingProviderSelectScreen: FC<
  StakingProviderSelectScreenProps
> = ({
  investments = [],
  onInvestmentClick: onProviderSelect,
  onBack,
  isLoading,
}) => {
  const { register, watch } = useForm({
    defaultValues: { query: "" },
  })

  const currentQueryValue = watch().query

  const dapps = useView(knownDappsWithIds(investments.map((i) => i.dappId)))
  const getInvestmentProviderInfo = useCallback(
    (
      investment: StrkDelegatedStakingInvestment | LiquidStakingInvestment,
    ): { name: string | undefined; url: string | undefined } | undefined => {
      if (
        investment.category === "strkDelegatedStaking" &&
        "stakerInfo" in investment
      ) {
        return {
          name: investment.stakerInfo.name,
          url: investment.stakerInfo.iconUrl,
        }
      }

      const dapp = dapps.find((dapp) => dapp.dappId === investment.dappId)
      return {
        name: dapp?.name,
        url: dapp?.logoUrl,
      }
    },
    [dapps],
  )
  const filteredInvestments = useMemo(() => {
    if (!currentQueryValue) {
      return investments
    }

    return investments.filter((investment) => {
      const query = currentQueryValue.trim().toLowerCase()
      return getInvestmentProviderInfo(investment)
        ?.name?.toLowerCase()
        .includes(query)
    })
  }, [currentQueryValue, investments, getInvestmentProviderInfo])

  const { ref, ...rest } = register("query")
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  const hasInvestments = Boolean(investments.length)
  const hasFilteredInvestments = Boolean(filteredInvestments.length)

  const content = useMemo(() => {
    if (isLoading) {
      return <ListSkeleton />
    }

    if (!hasInvestments) {
      return <Empty icon={<AddressBookIcon />} title={`No providers`} />
    }

    return (
      <CellStack pt="0" flex={1}>
        {investments.length > 1 && (
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchPrimaryIcon />
            </InputLeftElement>
            <Input
              ref={(e) => {
                ref(e)
                inputRef.current = e
              }}
              {...rest}
              autoComplete="off"
              placeholder="Search"
              type="text"
            />
          </InputGroup>
        )}
        {hasFilteredInvestments ? (
          <Flex
            gap={1}
            justifyContent="space-between"
            alignItems="baseline"
            color="text-secondary"
            mx={0}
            mt={2}
          >
            <H5>Provider</H5>
            <L1 as="span">Est. APY</L1>
          </Flex>
        ) : (
          <Empty icon={<SearchPrimaryIcon />} title={`No matching providers`} />
        )}
        {filteredInvestments.map((provider) => {
          const apyPercentage = bigDecimal.formatUnits(
            bigDecimal.mul(
              bigDecimal.parseUnits(provider.metrics.totalApy),
              bigDecimal.toBigDecimal(100, 0),
            ),
          )

          const providerInfo = getInvestmentProviderInfo(provider)

          return (
            <CustomButtonCell
              key={provider.id}
              onClick={() => onProviderSelect(provider)}
            >
              <Square
                size={10}
                rounded="md"
                bg="surface-elevated-hover"
                color="text-secondary"
                position="relative"
                overflow="hidden"
              >
                <Image
                  fit="cover"
                  src={providerInfo?.url}
                  fallback={<NoImageSecondaryIcon fontSize="xl" />}
                />
              </Square>
              <Flex
                grow={1}
                direction="column"
                justifySelf="flex-start"
                gap={0.5}
              >
                <H5>{providerInfo?.name}</H5>
                {provider.metrics.tvl !== undefined && (
                  <P4 color="text-secondary">
                    {prettifyCurrencyValue(provider.metrics.tvl, undefined, {
                      minDecimalPlaces: 0,
                    })}
                  </P4>
                )}
              </Flex>
              <H5>{prettifyCurrencyNumber(apyPercentage)}%</H5>
            </CustomButtonCell>
          )
        })}
      </CellStack>
    )
  }, [
    filteredInvestments,
    getInvestmentProviderInfo,
    hasFilteredInvestments,
    hasInvestments,
    inputRef,
    investments.length,
    isLoading,
    onProviderSelect,
    ref,
    rest,
  ])

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={onBack} />}
      title={"Select a provider"}
      {...rest}
    >
      {content}
    </NavigationContainer>
  )
}
