import type { SquareProps } from "@chakra-ui/react"
import { Circle } from "@chakra-ui/react"
import type { FC } from "react"

interface TransactionIconProps extends Omit<SquareProps, "outline"> {
  iconComponent?: JSX.Element
  badgeComponent?: JSX.Element
  outline?: boolean
  size?: number
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  iconComponent,
  badgeComponent,
  outline,
  size = 18,
  ...rest
}: TransactionIconProps) => {
  const badgeSize = Math.min(32, Math.round((size * 16) / 36))
  const iconSize = Math.round((4 * (size * 16)) / 36)

  return (
    <Circle
      size={size}
      border={outline ? `1px solid white` : undefined}
      bg={"neutrals.600"}
      fontSize={iconSize}
      position={"relative"}
      {...rest}
    >
      {iconComponent}
      {badgeComponent && (
        <Circle
          overflow={"hidden"}
          position={"absolute"}
          right={0}
          bottom={0}
          size={badgeSize}
        >
          {badgeComponent}
        </Circle>
      )}
    </Circle>
  )
}
