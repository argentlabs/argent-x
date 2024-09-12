import { Button } from "@argent/x-ui"
import { ButtonProps } from "@chakra-ui/react"
import { FC, memo } from "react"

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
      p={4}
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
