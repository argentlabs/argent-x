import type { ButtonProps } from "@chakra-ui/react"
import { Button, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { Suspense } from "react"
import type { ParsedPositionWithUsdValue } from "../../../../shared/defiDecomposition/schema"
import { DefiIcon } from "./DefiIcon"
import { DefiPositionBalance } from "./DefiPositionBalance"
import { DefiPositionDescription } from "./DefiPositionDescription"
import { DefiPositionSkeleton } from "./DefiPositionSkeleton"
import { DefiPositionTitle } from "./DefiPositionTitle"
import { useView } from "../../../views/implementation/react"
import { investmentPositionViewFindByIdAtom } from "../../../views/investments"
import { buttonHoverStyle } from "@argent/x-ui/theme"

export interface DefiPositionProps extends ButtonProps {
  parsedPosition: ParsedPositionWithUsdValue
  networkId: string
  isHighlighted?: boolean
}

export const DefiPosition: FC<DefiPositionProps> = ({
  parsedPosition,
  networkId,
  isHighlighted,
  onClick,
  ...rest
}) => {
  const position = useView(
    investmentPositionViewFindByIdAtom({ positionId: parsedPosition.id }),
  )

  const title = position?.title

  const boxShadow = isHighlighted ? buttonHoverStyle.boxShadow : undefined
  return (
    <Suspense fallback={<DefiPositionSkeleton />}>
      <Button
        boxShadow={boxShadow}
        p={0}
        h="initial"
        rounded={"unset"}
        minHeight={17.5}
        textAlign="left"
        fontWeight="initial"
        justifyContent="initial"
        w="full"
        flexDirection="column"
        onClick={onClick}
        {...rest}
      >
        <Flex p={4} w="full" gap="1" overflow="hidden">
          <Flex gap="3" alignItems="center" overflow="hidden">
            <DefiIcon position={parsedPosition} networkId={networkId} />
            <Flex direction="column" gap={0.5} overflow="hidden">
              <DefiPositionTitle overflow="hidden" textOverflow="ellipsis">
                {title}
              </DefiPositionTitle>
              <DefiPositionDescription
                position={parsedPosition}
                networkId={networkId}
              />
            </Flex>
          </Flex>
          <Flex
            ml="auto"
            direction="column"
            textAlign="right"
            gap={0.5}
            justifyContent={"center"}
          >
            <DefiPositionBalance position={parsedPosition} />
          </Flex>
        </Flex>
      </Button>
    </Suspense>
  )
}
