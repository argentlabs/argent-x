import { CopyTooltip, L2, P3, P4, icons } from "@argent/ui"
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

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewWithType,
} from "../../../../shared/transactionReview.service"
import { ApiTransactionSimulationResponse } from "../../../../shared/transactionSimulation/types"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../../services/addresses"
import { useCurrentNetwork, useIsMainnet } from "../../networks/useNetworks"
import { NftDetails } from "./NftDetails"
import { UnknownTokenIcon } from "./UnknownTokenIcon"
import { useAggregatedSimData } from "./useTransactionSimulatedData"

const { InfoIcon, AlertIcon } = icons

export interface BalanceChangeOverviewProps {
  transactionSimulation: ApiTransactionSimulationResponse
  transactionReview?: ApiTransactionReviewResponse
}

export const BalanceChangeOverview: FC<BalanceChangeOverviewProps> = ({
  transactionSimulation,
  transactionReview,
}) => {
  const aggregatedData = useAggregatedSimData(transactionSimulation)
  const network = useCurrentNetwork()
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )
  const allTransferSafe = useMemo(
    () => aggregatedData.every((t) => t.safe),
    [aggregatedData],
  )

  const isMainnet = useIsMainnet()

  return (
    <Box borderRadius="xl">
      <Box backgroundColor="neutrals.700" px="3" py="2.5" borderTopRadius="xl">
        <Flex alignItems="center" gap="1">
          {transactionReviewWithType?.type === "transfer" ? (
            <P4 fontWeight="bold" color="neutrals.100">
              Balance change
            </P4>
          ) : (
            <>
              <P4 fontWeight="bold" color="neutrals.100">
                Estimated balance change
              </P4>
              <Tooltip label="The balance change after successful swap">
                <Text color="neutrals.300" cursor="pointer">
                  <InfoIcon />
                </Text>
              </Tooltip>
            </>
          )}
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
            (
              { amount, recipients, token, usdValue, approvals, safe },
              dataIndex,
            ) => (
              <AccordionItem
                key={[token.address, "transfer", dataIndex].join("-")}
                border="none"
                color="white"
                isDisabled={isEmpty(approvals) && isEmpty(recipients)}
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
                            dataIndex !== aggregatedData.length - 1
                              ? "3"
                              : "3.5"
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
                            {token.image ? (
                              <Image src={token.image} w="5" h="5" />
                            ) : (
                              <UnknownTokenIcon w="5" h="5" fontSize="10px" />
                            )}
                            <P4 fontWeight="bold">
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
                              <L2 color="neutrals.300">
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
                          networkId={network.id}
                          dataIndex={dataIndex}
                          totalData={aggregatedData.length}
                          amount={amount}
                          usdValue={usdValue}
                          safe={safe}
                          isMainnet={isMainnet}
                          isDisabled={isDisabled}
                        />
                      )}
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
                                    color="neutrals.300"
                                    _hover={{
                                      color: "text",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {formatTruncatedAddress(approval.spender)}
                                  </P4>
                                </CopyTooltip>

                                <P4 color="neutrals.400" fontWeight="bold">
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
                      {!isEmpty(recipients) && (
                        <>
                          <Divider color="black" opacity="1" />
                          <Flex flexDirection="column" gap="3" py="4">
                            <Flex justifyContent="space-between">
                              <P4 fontWeight="bold" color="neutrals.300">
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
                                    color="neutrals.300"
                                    _hover={{
                                      color: "text",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {formatTruncatedAddress(recipient.address)}
                                  </P4>
                                </CopyTooltip>

                                <P4 color="neutrals.400" fontWeight="bold">
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
          <Box m="2" borderRadius="lg" px="2" py="3" bgColor="neutrals.700">
            <Flex justifyContent="flex-start" alignItems="flex-start" gap="2">
              <P3 color="error.500" fontWeight="bold" mt="0.25">
                <AlertIcon />
              </P3>
              <Flex direction="column" gap="1" alignItems="flex-start">
                <P4 color="error.500" fontWeight="bold">
                  Warning: Approved spending limit
                </P4>
                <P4 color="neutrals.100">
                  You’re approving one or more addresses to spend more tokens
                  than you’re using in this transaction. These funds will not be
                  spent but you should not proceed if you don’t trust this app
                </P4>
              </Flex>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
