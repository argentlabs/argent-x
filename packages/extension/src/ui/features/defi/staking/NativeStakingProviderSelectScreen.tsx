import type { StrkDelegatedStakingInvestment } from "@argent/x-shared"
import { prettifyCurrencyValue } from "@argent/x-shared"
import { bigDecimal, prettifyCurrencyNumber } from "@argent/x-shared"
import {
  BarCloseButton,
  CellStack,
  Empty,
  H5,
  icons,
  Input,
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
} from "@chakra-ui/react"
import type { FC } from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"

import { CustomButtonCell } from "../../../components/CustomButtonCell"
import { ListSkeleton } from "../../../components/ScreenSkeleton"
import { useAutoFocusInputRef } from "../../../hooks/useAutoFocusInputRef"

const { SearchPrimaryIcon, AddressBookIcon, NoImageSecondaryIcon } = icons

interface NativeStakingProviderSelectScreenProps {
  investments?: StrkDelegatedStakingInvestment[]
  onInvestmentClick: (investment: StrkDelegatedStakingInvestment) => void
  onBack: () => void
  isLoading: boolean
}

export const NativeStakingProviderSelectScreen: FC<
  NativeStakingProviderSelectScreenProps
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

  const filteredInvestments = useMemo(() => {
    if (!currentQueryValue) {
      return investments
    }

    return investments.filter(({ stakerInfo }) => {
      const query = currentQueryValue.trim().toLowerCase()
      return stakerInfo.name?.toLowerCase().includes(query)
    })
  }, [investments, currentQueryValue])

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
                  src={provider.stakerInfo.iconUrl}
                  fallback={<NoImageSecondaryIcon fontSize="xl" />}
                />
              </Square>
              <Flex
                grow={1}
                direction="column"
                justifySelf="flex-start"
                gap={0.5}
              >
                <H5>{provider.stakerInfo.name}</H5>
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
    hasFilteredInvestments,
    hasInvestments,
    inputRef,
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
