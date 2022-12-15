import { alertAnatomy } from "@chakra-ui/anatomy"
import {
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Alert as ChakraAlert,
  AlertProps as ChakraAlertProps,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import { FC, PropsWithChildren, ReactNode } from "react"

import { Button } from "./Button"
import { typographyStyles } from "./Typography"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys)

const baseStyle = definePartsStyle((props) => {
  const { colorScheme: c } = props
  return {
    container: {
      display: "flex",
      alignItems: "center",
    },
    icon: {
      rounded: "full",
      bg: `${c}.500`,
      color: mode(`${c}.100`, `${c}.900`)(props),
      fontSize: "base",
      w: 9,
      h: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typographyStyles.L1,
    },
    description: {
      ...typographyStyles.L2,
    },
  }
})

const variants = {
  subtle: definePartsStyle((props) => {
    const { colorScheme: c, as } = props
    const isButton = as === AsAlertButton
    return {
      container: {
        bg: mode(`${c}.100`, `${c}.900`)(props),
        _hover: isButton
          ? {
              bg: mode(`${c}.200`, `${c}.800`)(props),
            }
          : {},
        _active: isButton
          ? {
              bg: mode(`${c}.300`, `${c}.700`)(props),
            }
          : {},
      },
      description: {
        color: "white50",
      },
    }
  }),
  solid: definePartsStyle((props) => {
    const { colorScheme: c, as } = props
    const isButton = as === AsAlertButton
    return {
      container: {
        bg: `${c}.500`,
        _hover: isButton
          ? {
              bg: `${c}.600`,
            }
          : {},
        _active: isButton
          ? {
              bg: `${c}.700`,
            }
          : {},
      },
      description: {
        color: "black50",
      },
    }
  }),
}

const sizes = {
  base: definePartsStyle({
    container: {
      px: 3,
      py: 3,
      rounded: "base",
    },
  }),
  lg: definePartsStyle({
    container: {
      p: 4,
      rounded: "xl",
    },
    title: {
      ...typographyStyles.H6,
    },
    description: {
      ...typographyStyles.P4,
      fontWeight: "bold",
      color: "white50",
    },
  }),
}

export const alertTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: "base",
  },
})

export interface AlertProps
  extends PropsWithChildren,
    Omit<ChakraAlertProps, "children"> {
  title?: string
  description?: string
  icon?: ReactNode
}

/**
 * Wraps Chakra Alert {@link https://chakra-ui.com/docs/components/alert}
 * with a simpler API for most common use cases of title, description and icon
 */

export const Alert: FC<AlertProps> = ({
  title,
  description,
  icon,
  children,
  ...rest
}) => {
  return (
    <ChakraAlert {...rest}>
      {icon && <AlertIcon>{icon}</AlertIcon>}
      <Box>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </Box>
      {children}
    </ChakraAlert>
  )
}

/** Used by {@link AlertButton} - applies basic 'Alert' styling to Button for same appearance */

const AsAlertButton: FC<typeof Button> = (props) => {
  return (
    <Button
      h={"inhert"}
      justifyContent={"inherit"}
      textAlign={"inherit"}
      width={"100%"}
      whiteSpace={"inherit"}
      {...props}
    />
  )
}

/**
 * Wraps Chakra Alert {@link https://chakra-ui.com/docs/components/alert}
 * with Button behaviour
 */

export const AlertButton: FC<AlertProps> = (props) => {
  return <Alert as={AsAlertButton} {...props} />
}
