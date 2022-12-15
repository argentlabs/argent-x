import { chakra, shouldForwardProp } from "@chakra-ui/react"
import { isValidMotionProp, motion } from "framer-motion"

export const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
})
