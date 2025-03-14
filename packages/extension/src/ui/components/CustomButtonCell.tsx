import { Button } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import type { FC } from "react"
import { memo } from "react"

export interface CustomButtonCellProps extends ButtonProps {
  highlighted?: boolean
  transparent?: boolean
}

const CustomButtonCellRaw: FC<CustomButtonCellProps> = ({
  highlighted,
  transparent,
  ...rest
}) => {
  const colorScheme = transparent
    ? "transparent"
    : highlighted
      ? "secondary"
      : "default"
  return (
    <Button
      gap={3}
      px={4}
      py={3.5}
      h={"initial"}
      textAlign={"left"}
      fontWeight={"initial"}
      colorScheme={colorScheme}
      rounded={"xl"}
      {...rest}
    />
  )
}

const CustomButtonCell = memo(CustomButtonCellRaw)

export { CustomButtonCell }
