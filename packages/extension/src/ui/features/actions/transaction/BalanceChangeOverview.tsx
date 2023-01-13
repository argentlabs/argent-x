import { CopyTooltip, L2, P4, icons } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Image,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, useMemo } from "react"
import { number } from "starknet"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { ApiTransactionSimulationResponse } from "../../../../shared/transactionSimulation.service"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../../services/addresses"
import { useAggregatedSimData } from "./useTransactionSimulatedData"

const { InfoIcon } = icons

export interface BalanceChangeOverviewProps {
  transactionSimulation: ApiTransactionSimulationResponse
}

export const BalanceChangeOverview: FC<BalanceChangeOverviewProps> = ({
  transactionSimulation,
}) => {
  const aggregatedData = useAggregatedSimData(transactionSimulation)

  return (
    <Box borderRadius="xl">
      <Box backgroundColor="neutrals.700" px="3" py="2.5" borderTopRadius="xl">
        <Flex alignItems="center" gap="1">
          <P4 fontWeight="bold" color="neutrals.100">
            Estimated balance change
          </P4>
          <Tooltip label="The balance change after successful swap">
            <Text color="neutrals.300" cursor="pointer">
              <InfoIcon />
            </Text>
          </Tooltip>
        </Flex>
      </Box>
      <Flex
        flexDirection="column"
        backgroundColor="neutrals.800"
        pt="3.5"
        borderBottomRadius="xl"
      >
        <Accordion allowToggle>
          {aggregatedData.map(
            ({ amount, recipients, token, usdValue, approvals }, dataIndex) => (
              <AccordionItem
                key={[token.address, "transfer"].join("-")}
                border="none"
                color="white"
                isDisabled={isEmpty(approvals) && isEmpty(recipients)}
              >
                {({ isDisabled }) => (
                  <>
                    <h2>
                      <AccordionButton
                        display="flex"
                        width="100%"
                        justifyContent="space-between"
                        outline="none"
                        px="3"
                        pb={
                          dataIndex !== aggregatedData.length - 1 ? "3" : "3.5"
                        }
                        _expanded={{
                          backgroundColor: "neutrals.700",
                          pb: "3.5",
                        }}
                        disabled={isDisabled}
                        _disabled={{
                          cursor: "auto",
                          opacity: 1,
                        }}
                        _hover={{
                          backgroundColor: isDisabled ? "" : "neutrals.700",
                          borderBottomRadius:
                            dataIndex === aggregatedData.length - 1
                              ? "xl"
                              : "0",
                        }}
                      >
                        <Flex alignItems="center" gap="2">
                          <Image src={token.image} w="5" h="5" />
                          <P4 fontWeight="bold">
                            {token.name === "Ether" ? "Ethereum" : token.name}{" "}
                          </P4>
                        </Flex>
                        <Flex
                          direction="column"
                          gap="0.5"
                          alignItems="flex-end"
                        >
                          <P4
                            color={
                              amount.isNegative()
                                ? "error.500"
                                : "secondary.500"
                            }
                            fontWeight="bold"
                          >
                            {prettifyTokenAmount({
                              amount: amount.toString(),
                              ...token,
                              showPlusSign: true,
                            })}
                          </P4>
                          <L2 color="neutrals.300">
                            {prettifyCurrencyValue(Math.abs(usdValue))}
                          </L2>
                        </Flex>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel
                      backgroundColor="neutrals.700"
                      borderBottomRadius={
                        dataIndex === aggregatedData.length - 1 ? "xl" : "0"
                      }
                      px="3"
                      py="0"
                    >
                      {!isEmpty(approvals) && (
                        <>
                          <Divider color="black" opacity="1" />
                          <Flex flexDirection="column" gap="3" py="4">
                            <Flex justifyContent="space-between">
                              <Flex alignItems="center" gap="1">
                                <P4 fontWeight="bold" color="neutrals.300">
                                  Approved spending limit
                                </P4>
                                <Tooltip label="Amount approved for swap">
                                  <Text color="neutrals.300" cursor="pointer">
                                    <InfoIcon />
                                  </Text>
                                </Tooltip>
                              </Flex>
                            </Flex>

                            {approvals.map((approval) => (
                              <Flex
                                key={[approval.token.address, "approval"].join(
                                  "-",
                                )}
                                justifyContent="space-between"
                              >
                                <P4 fontWeight="bold" color="neutrals.300">
                                  <CopyTooltip
                                    copyValue={normalizeAddress(
                                      approval.spender,
                                    )}
                                    prompt=""
                                  >
                                    <Box
                                      _hover={{
                                        color: "text",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {formatTruncatedAddress(approval.spender)}
                                    </Box>
                                  </CopyTooltip>
                                </P4>

                                <P4 color="neutrals.400" fontWeight="bold">
                                  {prettifyTokenAmount({
                                    amount: approval.amount.toString(),
                                    ...approval.token,
                                  })}
                                </P4>
                              </Flex>
                            ))}
                          </Flex>
                        </>
                      )}
                      {!isEmpty(recipients) && (
                        <>
                          <Divider color="black" opacity="1" />
                          <Flex flexDirection="column" gap="3" py="4">
                            <Flex justifyContent="space-between">
                              <P4 fontWeight="bold" color="neutrals.300">
                                Recipients
                              </P4>
                            </Flex>

                            {recipients.map((recipient) => (
                              <Flex
                                key={["recipient", recipient.address].join("-")}
                                justifyContent="space-between"
                              >
                                <P4 fontWeight="bold" color="neutrals.300">
                                  <CopyTooltip
                                    copyValue={normalizeAddress(
                                      recipient.address,
                                    )}
                                    prompt=""
                                  >
                                    <Box
                                      _hover={{
                                        color: "text",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {formatTruncatedAddress(
                                        recipient.address,
                                      )}
                                    </Box>
                                  </CopyTooltip>
                                </P4>

                                <P4 color="neutrals.400" fontWeight="bold">
                                  {prettifyTokenAmount({
                                    amount: recipient.amount
                                      .multipliedBy(-1)
                                      .toString(),
                                    ...token,
                                    withSymbol: false,
                                  })}
                                </P4>
                              </Flex>
                            ))}
                          </Flex>
                        </>
                      )}
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            ),
          )}
        </Accordion>
      </Flex>
    </Box>
  )
}
