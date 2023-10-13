import { Flex, useColorMode } from "@chakra-ui/react"
import { AnimatePresence } from "framer-motion"
import { FC, useMemo } from "react"

import { MotionBox } from "../MotionBox"

const TransactionError: FC<{ error?: string }> = ({ error }) => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])
  return (
    <AnimatePresence>
      {error && (
        <MotionBox
          overflow={"hidden"}
          initial={{ opacity: 0, maxHeight: 0 }}
          animate={{ opacity: 1, maxHeight: "100%" }}
          exit={{ opacity: 0, maxHeight: 0 }}
          w="100%"
        >
          <Flex
            direction="column"
            backgroundColor={isDark ? "#330105" : "red.500"}
            boxShadow={isDark ? "menu" : "none"}
            py="3.5"
            px="3.5"
            borderRadius="xl"
            color={isDark ? "errorText" : "white"}
          >
            {error}
          </Flex>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}
export { TransactionError }
