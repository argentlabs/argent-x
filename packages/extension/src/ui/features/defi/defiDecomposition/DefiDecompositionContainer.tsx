import type { FC } from "react"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { defiDecompositionWithUsdValueAtom } from "../../../views/investments"
import { DefiDecomposition } from "./DefiDecomposition"
import type { FlexProps } from "@chakra-ui/react"
import { Flex, Skeleton } from "@chakra-ui/react"
import { DefiPositionSkeleton } from "./DefiPositionSkeleton"

export const DefiDecompositionContainer: FC = () => {
  const selectedAccount = useView(selectedAccountView)

  const defiDecompositionWithUsdValue = useView(
    defiDecompositionWithUsdValueAtom(selectedAccount),
  )

  if (!defiDecompositionWithUsdValue || !selectedAccount) {
    return null
  }

  return (
    <DefiDecomposition
      defiDecomposition={defiDecompositionWithUsdValue}
      account={selectedAccount}
    />
  )
}

export const StakedStrkOnlyDecompositionContainer: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const defiDecompositionWithUsdValue = useView(
    defiDecompositionWithUsdValueAtom(selectedAccount),
  )

  if (!defiDecompositionWithUsdValue || !selectedAccount) {
    return null
  }

  const strkOnlyDefiDecomp = defiDecompositionWithUsdValue.filter((defi) =>
    defi.products.some((product) => product.type === "strkDelegatedStaking"),
  )

  return (
    <DefiDecomposition
      defiDecomposition={strkOnlyDefiDecomp}
      account={selectedAccount}
    />
  )
}

export const DefiDecompositionSkeleton: FC<FlexProps> = (props) => {
  return (
    <Flex flexDirection="column" gap={4} {...props}>
      {[1, 2].map((_, index) => (
        <Flex flexDirection="column" gap={2} key={index}>
          <Flex alignItems="center">
            <Skeleton width="24px" height="24px" mr={4} />
            <Skeleton height="20px" width="150px" />
          </Flex>
          <Flex flexDirection="column" bg="surface-elevated" borderRadius="xl">
            <Flex
              px={4}
              py={3}
              alignItems="center"
              borderBottom="1px solid"
              borderBottomColor="stroke-default"
            >
              <Skeleton height="20px" width="150px" />
            </Flex>
            {[1, 2, 3].map((_, index) => (
              <DefiPositionSkeleton key={index} />
            ))}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
