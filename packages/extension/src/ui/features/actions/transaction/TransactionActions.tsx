import { CopyTooltip, P4 } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
} from "@chakra-ui/react"
import { FC, Fragment } from "react"
import { Call, number } from "starknet"

import { entryPointToHumanReadable } from "../../../../shared/transactions"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../../services/addresses"

export interface TransactionActionsProps {
  transactions: Call[]
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  transactions,
}) => {
  return (
    <Box borderRadius="xl">
      <Box backgroundColor="neutrals.700" px="3" py="2.5" borderTopRadius="xl">
        <P4 fontWeight="bold" color="neutrals.100">
          Actions
        </P4>
      </Box>
      <Accordion
        allowToggle
        backgroundColor="neutrals.800"
        pt="3.5"
        borderBottomRadius="xl"
      >
        {transactions.map((transaction, txIndex) => (
          <AccordionItem
            key={txIndex}
            border="none"
            color="white"
            isDisabled={
              !transaction.calldata || transaction.calldata?.length === 0
            }
          >
            {({ isDisabled, isExpanded }) => (
              <>
                <h2>
                  <AccordionButton
                    display="flex"
                    width="100%"
                    justifyContent="space-between"
                    outline="none"
                    px="3"
                    pb={txIndex !== transactions.length - 1 ? "3" : "3.5"}
                    _expanded={{
                      backgroundColor: "neutrals.700",
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
                      backgroundColor: isDisabled ? "" : "neutrals.700",
                      borderBottomRadius:
                        txIndex === transactions.length - 1 && !isExpanded
                          ? "xl"
                          : "0",
                    }}
                  >
                    <P4 fontWeight="bold">
                      {entryPointToHumanReadable(transaction.entrypoint)}
                    </P4>
                    <P4 color="neutrals.400" fontWeight="bold">
                      {formatTruncatedAddress(transaction.contractAddress)}
                    </P4>
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  backgroundColor="neutrals.700"
                  borderBottomRadius={
                    txIndex === transactions.length - 1 ? "xl" : "0"
                  }
                  px="3"
                >
                  <Divider color="black" opacity="1" />
                  <Flex flexDirection="column" gap="12px" py="3.5">
                    {transaction.calldata?.map((calldata, cdIndex) => (
                      <Flex
                        key={cdIndex}
                        justifyContent="space-between"
                        gap="2"
                      >
                        <P4 color="neutrals.300" fontWeight="bold">
                          Calldata {cdIndex + 1}
                        </P4>
                        <P4
                          color="neutrals.400"
                          fontWeight="bold"
                          maxWidth="70%"
                        >
                          <CopyTooltip copyValue={calldata} prompt="">
                            <Box
                              _hover={{
                                bg: "neutrals.700",
                                color: "text",
                                cursor: "pointer",
                              }}
                              whiteSpace="nowrap"
                              textOverflow="ellipsis"
                              overflow="hidden"
                              minWidth="0"
                            >
                              {number.isHex(calldata)
                                ? formatTruncatedAddress(calldata)
                                : calldata}
                            </Box>
                          </CopyTooltip>
                        </P4>
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
