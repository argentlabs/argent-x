import { Button } from "@argent/x-ui"
import { ButtonProps } from "@chakra-ui/react"
import { FC } from "react"

export interface CustomButtonCellProps extends ButtonProps {
  highlighted?: boolean
  transparent?: boolean
}

export const CustomButtonCell: FC<CustomButtonCellProps> = ({
  highlighted,
  transparent,
  ...rest
}) => {
  const colorScheme = transparent
    ? "transparent"
    : highlighted
      ? "tertiary"
      : "neutrals"
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
