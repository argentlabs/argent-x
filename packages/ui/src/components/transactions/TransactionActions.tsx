import {
  entryPointToHumanReadable,
  formatTruncatedAddress,
} from "@argent/shared"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  useColorMode,
} from "@chakra-ui/react"
import { FC, useMemo } from "react"
import { Call, number } from "starknet"

import { CopyTooltip } from "../CopyTooltip"
import { P4 } from "../Typography"

export interface TransactionActionsProps {
  transactions: Call[]
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  transactions,
}) => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])
  return (
    <Box borderRadius="xl" w="100%">
      <Box
        backgroundColor={isDark ? "neutrals.700" : "gray.50"}
        px="3"
        py="2.5"
        borderTopRadius="xl"
      >
        <P4 fontWeight="bold" color={isDark ? "neutrals.100" : "black"}>
          Actions
        </P4>
      </Box>
      <Accordion
        allowToggle
        backgroundColor={isDark ? "neutrals.300" : "white"}
        borderBottomRadius="xl"
      >
        {transactions.map((transaction, txIndex) => (
          <AccordionItem
            key={txIndex}
            border="none"
            isDisabled={
              !transaction.calldata || transaction.calldata?.length === 0
            }
          >
            {({ isDisabled, isExpanded }) => (
              <>
                <h2>
                  <AccordionButton
                    display="flex"
                    color="text" // this is for whatever reason needed to support light and dark mode
                    width="100%"
                    justifyContent="space-between"
                    outline="none"
                    px="3"
                    pb={txIndex !== transactions.length - 1 ? "3" : "3.5"}
                    _expanded={{
                      backgroundColor: isDark ? "neutrals.700" : "gray.50",
                      pb: "3.5",
                    }}
                    disabled={
                      !transaction.calldata ||
                      transaction.calldata?.length === 0
                    }
                    _disabled={{
                      cursor: "auto",
                      opacity: 1,
                    }}
                    _hover={{
                      backgroundColor: isDisabled
                        ? ""
                        : isDark
                        ? "neutrals.700"
                        : "gray.50",
                      borderBottomRadius:
                        txIndex === transactions.length - 1 && !isExpanded
                          ? "xl"
                          : "0",
                    }}
                  >
                    <P4 fontWeight="bold">
                      {entryPointToHumanReadable(transaction.entrypoint)}
                    </P4>
                    <P4 fontWeight="bold">
                      {formatTruncatedAddress(transaction.contractAddress)}
                    </P4>
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  backgroundColor={isDark ? "neutrals.700" : "gray.50"}
                  borderBottomRadius={
                    txIndex === transactions.length - 1 ? "xl" : "0"
                  }
                  px="3"
                  pb="0"
                >
                  <Divider color="black" opacity="1" />
                  <Flex flexDirection="column" gap="12px" py="3.5">
                    {transaction.calldata?.map((calldata, cdIndex) => (
                      <Flex
                        key={cdIndex}
                        justifyContent="space-between"
                        gap="2"
                      >
                        <P4 fontWeight="bold" color="text">
                          Calldata {cdIndex + 1}
                        </P4>

                        <CopyTooltip copyValue={calldata} prompt={calldata}>
                          <Box
                            _hover={{
                              backgroundColor: isDark
                                ? "neutrals.700"
                                : "gray.50",
                              color: "text",
                              cursor: "pointer",
                            }}
                            color="text"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                            overflow="hidden"
                            minWidth="0"
                          >
                            <P4 fontWeight="bold" maxWidth="70%">
                              {number.isHex(calldata)
                                ? formatTruncatedAddress(calldata)
                                : calldata}
                            </P4>
                          </Box>
                        </CopyTooltip>
                      </Flex>
                    ))}
                  </Flex>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  )
}
