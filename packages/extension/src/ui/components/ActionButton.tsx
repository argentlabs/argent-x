import { B2 } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import { Button, forwardRef } from "@chakra-ui/react"
import type { ReactElement } from "react"

interface ActionButtonProps extends ButtonProps {
  icon: ReactElement
  label: string
}

export const ActionButton = forwardRef<ActionButtonProps, "button">(
  ({ label, icon, colorScheme = "secondary", size, ...rest }, ref) => {
    const color = colorScheme === "primary" ? "surface-default" : undefined
    const diameter = size === "sm" ? 10 : 12
    const fontSize = size === "sm" ? "xl" : "2xl"
    const top = size === "sm" ? 12 : 14
    return (
      <Button
        ref={ref}
        aria-label={label}
        position="relative"
        size="auto"
        w={diameter}
        h={diameter}
        fontSize={fontSize}
        mb={6}
        colorScheme={colorScheme}
        color={color}
        {...rest}
      >
        {icon}
        <B2
          color="text-primary"
          position="absolute"
          top={top}
          textAlign="center"
        >
          {label}
        </B2>
      </Button>
    )
  },
)

ActionButton.displayName = "ActionButton"
