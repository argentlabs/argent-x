import { Flex, Text, useColorMode } from "@chakra-ui/react"
import { Collapse } from "@mui/material"
import { FC, useMemo, useState } from "react"

import { CopyTooltip } from "../CopyTooltip"
import { AlertIcon, ChevronDownIcon } from "../icons"
import { L1, Pre } from "../Typography"
import { makeClickable } from "./utils"

interface FeeEstimateErrorProps {
  parsedFeeEstimationError?: string
  showFeeError?: boolean
}

const FeeEstimateError: FC<FeeEstimateErrorProps> = ({
  parsedFeeEstimationError,
  showFeeError,
}) => {
  const [feeErrorExpanded, setFeeErrorExpanded] = useState(false)
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])
  return (
    <Flex
      direction="column"
      backgroundColor={isDark ? "#330105" : "red.500"}
      boxShadow={isDark ? "menu" : "none"}
      py="3.5"
      px="3.5"
      borderRadius="xl"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Flex gap="1" align="center">
          <Text color={isDark ? "errorText" : "white"}>
            <AlertIcon />
          </Text>
          <L1 color={isDark ? "errorText" : "white"}>
            {showFeeError
              ? "Not enough funds to cover for fees"
              : "Transaction failure predicted"}
          </L1>
        </Flex>
        {!showFeeError && (
          <Flex
            alignItems="flex-end"
            cursor="pointer"
            gap={1}
            {...makeClickable(() => setFeeErrorExpanded((x) => !x), {
              label: "Show error details",
            })}
          >
            <Text color={isDark ? "errorText" : "white"}>
              <ChevronDownIcon
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: feeErrorExpanded
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                }}
                height="14px"
                width="16px"
              />
            </Text>
          </Flex>
        )}
      </Flex>

      <Collapse
        in={feeErrorExpanded}
        timeout="auto"
        style={{
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {parsedFeeEstimationError && (
          <CopyTooltip copyValue={parsedFeeEstimationError} message="Copied">
            <Pre
              color={isDark ? "errorText" : "white"}
              pt="3"
              whiteSpace="pre-wrap"
            >
              {parsedFeeEstimationError}
            </Pre>
          </CopyTooltip>
        )}
      </Collapse>
    </Flex>
  )
}
export { FeeEstimateError }
