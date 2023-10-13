import { ChakraComponent, chakra, shouldForwardProp } from "@chakra-ui/react"
import {
  ForwardRefComponent,
  HTMLMotionProps,
  isValidMotionProp,
  motion,
} from "framer-motion"

export const StackScreenMotionContainer: ChakraComponent<
  ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>,
  HTMLMotionProps<"div">
> = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    transform: "50% 0",
    bg: "bg",
  },
})

export type StackScreenContainerProps = HTMLMotionProps<"div">
export const StackScreenContainer: ChakraComponent<
  ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>,
  StackScreenContainerProps
> = chakra(motion.div, {
  baseStyle: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
})
