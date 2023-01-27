import { Button } from "@chakra-ui/react"
import { ComponentProps } from "react"

export interface CustomButtonCellProps extends ComponentProps<typeof Button> {
  highlighted?: boolean
  transparent?: boolean
}

export const CustomButtonCell = ({
  highlighted,
  transparent,
  ...rest
}: CustomButtonCellProps): JSX.Element => {
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
