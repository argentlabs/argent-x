import {
  AggregatedSimData,
  ApiTransactionReviewResponse,
  formatTruncatedAddress,
  getTransactionReviewWithType,
  isUnlimitedAmount,
  normalizeAddress,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "@argent/shared"
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
  useColorMode,
} from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { CopyTooltip } from "../CopyTooltip"
import { AlertIcon, InfoIcon } from "../icons"
import { UnknownTokenIcon } from "../transactions/TransactionIcon/UnknownTokenIcon"
import { L2, P3, P4 } from "../Typography"
import { NftDetails } from "./NftDetails"

export interface BalanceChangeOverviewProps {
  networkId: string
  isMainnet?: boolean
  transactionReview?: ApiTransactionReviewResponse
  aggregatedSimData?: AggregatedSimData[]
}

export const BalanceChangeOverview: FC<BalanceChangeOverviewProps> = ({
  aggregatedSimData,
  transactionReview,
  networkId,
  isMainnet,
}) => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])

  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )

  const allTransferSafe = useMemo(
    () => aggregatedSimData?.every((t) => t.safe),
    [aggregatedSimData],
  )

  if (!aggregatedSimData || aggregatedSimData.length === 0) {
    return null
  }

  return (
    <Box borderRadius="xl" w="100%">
      <Box
        backgroundColor={isDark ? "neutrals.700" : "gray.50"}
        px="3"
        py="2.5"
        borderTopRadius="xl"
      >
        <Flex alignItems="center" gap="1">
          {transactionReviewWithType?.type === "transfer" ? (
            <P4 fontWeight="bold" color={isDark ? "neutrals.100" : "black"}>
              Balance change
            </P4>
          ) : (
            <>
              <P4 fontWeight="bold" color={isDark ? "neutrals.100" : "black"}>
                Estimated balance change
              </P4>
              <Tooltip label="The estimated balance change after transaction execution">
                <Text
                  color={isDark ? "neutrals.300" : "black"}
                  cursor="pointer"
                >
                  <InfoIcon />
                </Text>
              </Tooltip>
            </>
          )}
        </Flex>
      </Box>
      <Flex
        flexDirection="column"
        backgroundColor={isDark ? "neutrals.600" : "white"}
        borderBottomRadius="xl"
      >
        <Accordion allowToggle defaultIndex={!allTransferSafe ? 0 : undefined}>
          {aggregatedSimData.map(
            (
              { amount, recipients, token, usdValue, approvals, safe },
              dataIndex,
            ) => (
              <AccordionItem
                key={[token.address, "transfer", dataIndex].join("-")}
                border="none"
                color={isDark ? "white" : "black"}
                isDisabled={
                  (!approvals || approvals.length === 0) &&
                  (!recipients || recipients.length === 0)
                }
              >
                {({ isDisabled }) => (
                  <>
                    <h2>
                      {token.type === "erc20" ? (
                        <AccordionButton
                          display="flex"
                          width="100%"
                          justifyContent="space-between"
                          outline="none"
                          px="3"
                          pb={
                            dataIndex !== aggregatedSimData.length - 1
                              ? "3"
                              : "3.5"
                          }
                          _expanded={{
                            backgroundColor: isDark
                              ? "neutrals.700"
                              : "gray.50",
                            pb: "3.5",
                          }}
                          disabled={isDisabled}
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
                              dataIndex === aggregatedSimData.length - 1
                                ? "xl"
                                : "0",
                          }}
                        >
                          <Flex alignItems="center" gap="2">
                            {token.image ? (
                              <Image src={token.image} w="5" h="5" />
                            ) : (
                              <UnknownTokenIcon w="5" h="5" fontSize="10px" />
                            )}
                            <P4
                              fontWeight="bold"
                              color={isDark ? "neutrals.300" : "black"}
                            >
                              {token.name === "Ether" ? "Ethereum" : token.name}{" "}
                            </P4>
                            {!safe && (
                              <P3 color="error.500" fontWeight="bold" mt="0.25">
                                <AlertIcon />
                              </P3>
                            )}
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
                                amount: amount.toFixed(),
                                decimals: token.decimals,
                                symbol:
                                  token.type === "erc20" ? token.symbol : "NFT",
                                showPlusSign: true,
                              })}
                            </P4>

                            {/** 0 usdValue means we don't have any value */}
                            {isMainnet && !!usdValue && !usdValue.isZero() && (
                              <L2 color={isDark ? "neutrals.300" : "black"}>
                                {prettifyCurrencyValue(
                                  usdValue.abs().toString(),
                                )}
                              </L2>
                            )}
                          </Flex>
                        </AccordionButton>
                      ) : (
                        <NftDetails
                          contractAddress={token.address}
                          tokenId={token.tokenId}
                          networkId={networkId}
                          dataIndex={dataIndex}
                          totalData={aggregatedSimData.length}
                          amount={amount}
                          usdValue={usdValue}
                          safe={safe}
                          isMainnet={isMainnet}
                          isDisabled={isDisabled}
                        />
                      )}
                    </h2>
                    <AccordionPanel
                      backgroundColor={isDark ? "neutrals.700" : "white"}
                      borderBottomRadius={
                        dataIndex === aggregatedSimData.length - 1 ? "xl" : "0"
                      }
                      px="3"
                      py="0"
                    >
                      {approvals && (
                        <>
                          <Divider color="black" opacity="1" />
                          <Flex flexDirection="column" gap="3" py="4">
                            <Flex justifyContent="space-between">
                              <Flex alignItems="center" gap="1">
                                <P4
                                  fontWeight="bold"
                                  color={isDark ? "neutrals.300" : "black"}
                                >
                                  Approved spending limit
                                </P4>
                                <Tooltip label="The approved spending limit to one or multiple addresses after transaction execution">
                                  <Text
                                    color={isDark ? "white" : "black"}
                                    cursor="pointer"
                                  >
                                    <InfoIcon />
                                  </Text>
                                </Tooltip>
                              </Flex>
                            </Flex>

                            {approvals.map((approval, approvalIndex) => (
                              <Flex
                                key={approvalIndex}
                                justifyContent="space-between"
                              >
                                <CopyTooltip
                                  copyValue={normalizeAddress(approval.spender)}
                                  prompt=""
                                >
                                  <P4
                                    fontWeight="bold"
                                    color={isDark ? "neutrals.300" : "black"}
                                    _hover={{
                                      color: "text",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {formatTruncatedAddress(approval.spender)}
                                  </P4>
                                </CopyTooltip>

                                <P4
                                  color={
                                    isUnlimitedAmount(approval.amount.toFixed())
                                      ? "red.50"
                                      : isDark
                                      ? "neutrals.400"
                                      : "black"
                                  }
                                  fontWeight="bold"
                                >
                                  {prettifyTokenAmount({
                                    amount: approval.amount.toFixed(),
                                    ...approval.token,
                                    unlimitedText: "All your",
                                  })}
                                </P4>
                              </Flex>
                            ))}
                          </Flex>
                        </>
                      )}
                      {recipients && (
                        <>
                          <Divider color="black" opacity="1" />
                          <Flex flexDirection="column" gap="3" py="4">
                            <Flex justifyContent="space-between">
                              <P4
                                fontWeight="bold"
                                color={isDark ? "neutrals.300" : "black"}
                              >
                                Recipients
                              </P4>
                            </Flex>

                            {recipients.map((recipient, recipientIndex) => (
                              <Flex
                                key={[
                                  "recipient",
                                  recipient.address,
                                  recipientIndex,
                                ].join("-")}
                                justifyContent="space-between"
                              >
                                <CopyTooltip
                                  copyValue={normalizeAddress(
                                    recipient.address,
                                  )}
                                  prompt=""
                                >
                                  <P4
                                    fontWeight="bold"
                                    color={isDark ? "neutrals.300" : "black"}
                                    _hover={{
                                      color: "text",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {formatTruncatedAddress(recipient.address)}
                                  </P4>
                                </CopyTooltip>

                                <P4
                                  color={isDark ? "neutrals.400" : "black"}
                                  fontWeight="bold"
                                >
                                  {prettifyTokenAmount({
                                    amount: recipient.amount.toFixed(),
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
        {!allTransferSafe && (
          <Box
            m="2"
            borderRadius="lg"
            px="2"
            py="3"
            bgColor={isDark ? "neutrals.700" : "white"}
          >
            <Flex justifyContent="flex-start" alignItems="flex-start" gap="2">
              <P3 color="error.500" fontWeight="bold" mt="0.25">
                <AlertIcon />
              </P3>
              <Flex direction="column" gap="1" alignItems="flex-start">
                <P4 color="error.500" fontWeight="bold">
                  Caution: Approved spending limit
                </P4>
                <P4 color={isDark ? "neutrals.100" : "black"}>
                  You’re approving to an address more tokens than needed. Make
                  sure you trust this dapp.
                </P4>
              </Flex>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
