import { H5 } from "@argent/x-ui"
import React from "react"
import type { ParsedPosition } from "../../../../../shared/defiDecomposition/schema"
import { HStack } from "@chakra-ui/react"
import { DefiIcon } from "../DefiIcon"
import { useView } from "../../../../views/implementation/react"
import { positionTitleDetailsFindAtom } from "../../../../views/investments"

interface DefiPositionDetailsTitleProps {
  position: ParsedPosition
  networkId: string
}

export const DefiPositionDetailsTitle: React.FC<
  DefiPositionDetailsTitleProps
> = ({ position, networkId }) => {
  const detailsTitle = useView(positionTitleDetailsFindAtom(position))

  return (
    <HStack gap="2">
      <DefiIcon position={position} networkId={networkId} size={6} />
      <H5>{detailsTitle}</H5>
    </HStack>
  )
}
