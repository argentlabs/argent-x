import { chakra, shouldForwardProp } from "@chakra-ui/react"
import { isValidMotionProp, motion } from "framer-motion"

export const StackScreenMotionContainer = chakra(motion.div, {
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
    transformOrigin: "50% 0",
    bg: "bg",
  },
})

export const StackScreenContainer = chakra(motion.div, {
  baseStyle: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
})
