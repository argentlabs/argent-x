import { H5, L1Bold, P4Bold } from "@argent/x-ui"
import type { SquareProps } from "@chakra-ui/react"
import { Flex, HStack, Image, Square, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"
import { memo, useState } from "react"
import type { SwapQuoteRoute } from "../../../../shared/swap/model/quote.model"
import type { BaseTradeProvider } from "../../../../shared/swap/model/trade.model"
import { useSwapTradeProviders } from "../hooks/useSwapTradeProviders"

import { ValidatorSecondaryIcon } from "@argent/x-ui/icons"

interface ProviderIconProps extends SquareProps {
  iconUrl?: string
}

/**
 * This component is used to display the provider icon
 * We need the loading icon state to handle flickers while the image is loading.
 */
const ProviderIconRaw: FC<ProviderIconProps> = ({
  iconUrl,
  size = 5,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoadComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      <Square
        rounded="md"
        color="text-secondary"
        position="relative"
        overflow="hidden"
        size={size}
        {...rest}
      >
        <Image
          fit="cover"
          src={iconUrl}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.2s ease-in-out",
          }}
          onLoad={handleLoadComplete}
          onError={() => {
            setHasError(true)
            handleLoadComplete()
          }}
          fallback={
            !iconUrl || (hasError && !isLoading) ? (
              <Square rounded="md" bg="surface-elevated-hover" size={size}>
                <ValidatorSecondaryIcon
                  fontSize="small"
                  bg="surface-elevated-hover"
                />
              </Square>
            ) : undefined
          }
        />
      </Square>
    </>
  )
}

// memoize the component to avoid re-rendering when the props are the same
const ProviderIcon = memo(ProviderIconRaw)

interface ProvidersRawProps {
  NameComponent?: React.ComponentType<{ children: React.ReactNode }>
  providers: BaseTradeProvider[]
}

const ProvidersRaw = ({ NameComponent = H5, providers }: ProvidersRawProps) => {
  return (
    <HStack flexDirection={"column"} gap={2} p={1} borderRadius="4px">
      {providers.map((p) => (
        <Flex key={p.name} width="full" gap={1} alignItems="center">
          <ProviderIcon iconUrl={p.iconUrl} />
          <NameComponent>{p.name}</NameComponent>
        </Flex>
      ))}
    </HStack>
  )
}

export const Providers = memo(ProvidersRaw)

interface ProvidersInfoProps {
  tradeRoute: SwapQuoteRoute
}

export const SwapProviders: React.FC<ProvidersInfoProps> = ({
  tradeRoute,
}: ProvidersInfoProps) => {
  const providers = useSwapTradeProviders(tradeRoute)
  if (providers.length === 0) return null

  return (
    <HStack justify="space-between" height={"50px"} px="4">
      <P4Bold color="text-secondary">Provider</P4Bold>
      <HStack>
        {providers.length > 1 && (
          <Tooltip
            label={<Providers NameComponent={L1Bold} providers={providers} />}
          >
            <L1Bold bg="surface-default" px="2" py="1" borderRadius="8px">
              {providers.length} providers
            </L1Bold>
          </Tooltip>
        )}
        {providers.length === 1 && <Providers providers={providers} />}
      </HStack>
    </HStack>
  )
}
