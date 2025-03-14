import type { Address } from "@argent/x-shared"
import { B1, TokenIcon, UnknownTokenIcon, useToken } from "@argent/x-ui"
import type { SquareProps } from "@chakra-ui/react"
import { Box, Square, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"
import type {
  ParsedCollateralizedDebtPosition,
  ParsedConcentratedLiquidityPosition,
  ParsedPosition,
  ParsedStrkDelegatedStakingPosition,
} from "../../../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isCollateralizedDebtPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../../../shared/defiDecomposition/schema"
import { StakerIcon } from "../staking/StakerIcon"

export interface DefiIconProps {
  position: ParsedPosition
  networkId: string
  size?: number
}

const TokenDefiIcon = ({
  address,
  networkId,
  size = 10,
  ...rest
}: {
  address: Address
  networkId: string
  size: number
} & SquareProps) => {
  const token = useToken({
    networkId,
    address,
  })

  if (!token) {
    return <UnknownTokenIcon size={size} {...rest} />
  }
  return (
    <TokenIcon url={token.iconUrl} name={token.name} size={size} {...rest} />
  )
}

const CountDefiIcon: FC<SquareProps> = ({
  children,
  size = 9,
  fontSize,
  ...rest
}) => {
  return (
    <Square size={size} rounded="lg" bgColor="surface-elevated-hover" {...rest}>
      <B1 lineHeight={1} fontSize={fontSize}>
        {children}
      </B1>
    </Square>
  )
}

const ConcentratedLiquidityIcon = ({
  position,
  size,
}: {
  position: ParsedConcentratedLiquidityPosition
  size: number
}) => {
  return (
    <Square size={size} position="relative">
      <TokenDefiIcon
        address={position.token0.address}
        networkId={position.token0.networkId}
        size={size > 8 ? 6.5 : 4}
        fontSize="sm"
        position="absolute"
        left={0}
      />
      <TokenDefiIcon
        address={position.token1.address}
        networkId={position.token1.networkId}
        size={size > 8 ? 6.5 : 4}
        fontSize="sm"
        position="absolute"
        right={0}
        filter="drop-shadow(-1px 0px var(--chakra-colors-surface-elevated))"
      />
    </Square>
  )
}

const CollateralizedDebtIcon = ({
  position,
  size,
}: {
  position: ParsedCollateralizedDebtPosition
  size: number
}) => {
  if (isCollateralizedDebtLendingPosition(position)) {
    return (
      <TokenDefiIcon
        address={position.token.address}
        networkId={position.token.networkId}
        size={size}
      />
    )
  }
  if (isCollateralizedDebtBorrowingPosition(position)) {
    let debtIcon
    if (position.debtPositions.length === 1) {
      debtIcon = (
        <TokenDefiIcon
          address={position.debtPositions[0].token.address}
          networkId={position.debtPositions[0].token.networkId}
          size={size}
          position="absolute"
          left={0}
          top={0}
        />
      )
    } else {
      debtIcon = (
        <CountDefiIcon
          size={size}
          rounded="full"
          position="absolute"
          left={0}
          top={0}
          fontSize={"h5"}
        >
          {position.debtPositions.length}
        </CountDefiIcon>
      )
    }

    let collateralIcon
    if (position.collateralizedPositions.length === 1) {
      collateralIcon = (
        <TokenDefiIcon
          address={position.collateralizedPositions[0].token.address}
          networkId={position.collateralizedPositions[0].token.networkId}
          size={size > 8 ? 4 : 3}
          fontSize="3xs"
          position="absolute"
          right={"-4px"}
          bottom={0}
          filter="drop-shadow(-1px -1px var(--chakra-colors-surface-elevated))"
        />
      )
    } else {
      collateralIcon = (
        <CountDefiIcon
          size={size > 8 ? 4 : 3}
          rounded="full"
          fontSize="3xs"
          position="absolute"
          right={"-4px"}
          bottom={0}
          filter="drop-shadow(-1px -1px var(--chakra-colors-surface-elevated))"
        >
          {position.collateralizedPositions.length}
        </CountDefiIcon>
      )
    }
    return (
      <Square size={size} position="relative">
        {debtIcon}
        {collateralIcon}
      </Square>
    )
  }
}

const StrkDelegatedStakingIcon = ({
  position,
  size,
}: {
  position: ParsedStrkDelegatedStakingPosition
  size: number
}) => {
  return (
    <Square size={size} rounded="full" position="relative">
      <TokenDefiIcon
        size={size}
        address={position.token.address}
        networkId={position.token.networkId}
      />
      <Tooltip
        label={position.stakerInfo.name}
        aria-label={position.stakerInfo.name}
        offset={[0, 25]}
      >
        {/* need this box for the tooltip, because it does not show properly due to StakerIcon's position absolute */}
        <Box>
          <StakerIcon
            size={`${size * 1.6}px`}
            iconUrl={position.stakerInfo.iconUrl}
            rounded="3px"
            position="absolute"
            right={0}
            bottom={0}
          />
        </Box>
      </Tooltip>
    </Square>
  )
}

const DefiIcon: FC<DefiIconProps> = ({ position, size = 10 }) => {
  if (isConcentratedLiquidityPosition(position)) {
    return <ConcentratedLiquidityIcon position={position} size={size} />
  }

  if (isStrkDelegatedStakingPosition(position)) {
    return <StrkDelegatedStakingIcon position={position} size={size} />
  }

  if (isStakingPosition(position) || isDelegatedTokensPosition(position)) {
    return (
      <TokenDefiIcon
        address={position.token.address}
        networkId={position.token.networkId}
        size={size}
      />
    )
  }
  if (isCollateralizedDebtPosition(position)) {
    return <CollateralizedDebtIcon position={position} size={size} />
  }
  return <UnknownTokenIcon size={size} />
}

export { DefiIcon }
