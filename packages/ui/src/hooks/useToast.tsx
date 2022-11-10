import {
  Flex,
  Text,
  UseToastOptions,
  useToast as chakraUseToast,
} from "@chakra-ui/react"

import { L1, icons } from "../components"

const { AlertIcon, InfoIcon, TickCircleIcon, LoaderIcon } = icons

const ICON_MAP = {
  info: <InfoIcon />,
  warning: <AlertIcon />,
  success: <TickCircleIcon />,
  error: <AlertIcon />,
  loading: <LoaderIcon />,
}

const COLOR_MAP = {
  info: "info.500",
  warning: "warning.500",
  success: "success.500",
  error: "error.500",
  loading: "neutrals.500",
}

/** Wraps Chakra `useToast()` with a custom component render */

export const useToast = (defaultOptions?: UseToastOptions) => {
  const chakraToast = chakraUseToast(defaultOptions)
  return (options: UseToastOptions) => {
    const { title, status = "info" } = options
    const icon = ICON_MAP[status]
    const backgroundColor = COLOR_MAP[status]
    const render = () => {
      return (
        <Flex
          alignItems={"center"}
          p={3}
          gap={3}
          borderRadius={"lg"}
          backgroundColor={backgroundColor}
        >
          <Text fontSize={"2xl"}>{icon}</Text>
          <L1 textTransform={"initial"}>{title}</L1>
        </Flex>
      )
    }
    return chakraToast({ render, ...options })
  }
}
