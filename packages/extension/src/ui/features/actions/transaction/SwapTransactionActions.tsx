import { L2, P4, icons } from "@argent/ui"
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
import { FC, Fragment } from "react"

import { useToken } from "../../../../shared/tokens.state"
import { ApiTransactionReviewActivity } from "../../../../shared/transactionReview.service"
import { formatTokenBalance } from "../../accountTokens/tokens.service"
import { useCurrentNetwork } from "../../networks/useNetworks"

const { InfoIcon } = icons

export interface SwapTransactionActionsProps {
  swapTransaction: ApiTransactionReviewActivity
  approveTransaction?: ApiTransactionReviewActivity
}

export const SwapTransactionActions: FC<SwapTransactionActionsProps> = ({
  swapTransaction,
  approveTransaction,
}) => {
  const network = useCurrentNetwork()

  const srcToken = useToken({
    address: swapTransaction?.src?.token.address || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: swapTransaction?.dst?.token.address || "0x0",
    networkId: network.id,
  })

  const tokensInfo = [
    { type: "src", ...swapTransaction.src, token: srcToken },
    { type: "dst", ...swapTransaction.dst, token: dstToken },
  ]

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
      <Accordion
        allowToggle
        backgroundColor="neutrals.800"
        pt="3.5"
        borderBottomRadius="xl"
      >
        {tokensInfo.map((tokenInfo, tokenInfoIndex) => (
          <AccordionItem
            key={tokenInfoIndex}
            border="none"
            color="white"
            isDisabled={!approveTransaction || tokenInfo.type === "dst"}
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
                    pb={tokenInfoIndex !== tokensInfo.length - 1 ? "3" : "3.5"}
                    _expanded={{
                      backgroundColor: "neutrals.700",
                      pb: "3.5",
                    }}
                    disabled={!approveTransaction || tokenInfo.type === "dst"}
                    _disabled={{
                      cursor: "auto",
                      opacity: 1,
                    }}
                    _hover={{
                      backgroundColor: isDisabled ? "" : "neutrals.700",
                      borderBottomRadius:
                        tokenInfoIndex === tokensInfo.length - 1 && !isExpanded
                          ? "xl"
                          : "0",
                    }}
                  >
                    <Flex alignItems="center" gap="2">
                      <Image src={tokenInfo.token?.image} w="5" h="5" />
                      <P4 fontWeight="bold">
                        {tokenInfo.token?.name === "Ether"
                          ? "Ethereum"
                          : tokenInfo.token?.name}{" "}
                      </P4>
                    </Flex>
                    <Flex direction="column" gap="0.5" alignItems="flex-end">
                      <P4
                        color={
                          tokenInfo.type === "src"
                            ? "error.500"
                            : "secondary.500"
                        }
                        fontWeight="bold"
                      >
                        {`${tokenInfo.type === "src" ? "-" : "+"}`}
                        {formatTokenBalance(
                          tokenInfo.amount,
                          tokenInfo.token?.decimals,
                        )}{" "}
                        {tokenInfo.token?.symbol}
                      </P4>
                      <L2 color="neutrals.300">${tokenInfo.usd}</L2>
                    </Flex>
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  backgroundColor="neutrals.700"
                  borderBottomRadius={
                    tokenInfoIndex === tokensInfo.length - 1 ? "xl" : "0"
                  }
                  px="3"
                  py="0"
                >
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

                      <P4 color="neutrals.400" fontWeight="bold">
                        {formatTokenBalance(
                          approveTransaction?.value?.amount,
                          approveTransaction?.value?.token.decimals,
                        )}{" "}
                        {approveTransaction?.value?.token.symbol}
                      </P4>
                    </Flex>
                    {/* {swapTransaction.recipient && (
                      <Flex justifyContent="space-between">
                        <P4 fontWeight="bold" color="neutrals.300">
                          Recipient
                        </P4>

                        <P4 color="neutrals.400" fontWeight="bold">
                          <CopyTooltip
                            copyValue={normalizeAddress(
                              swapTransaction.recipient,
                            )}
                            prompt=""
                          >
                            <Box
                              _hover={{
                                bg: "neutrals.700",
                                color: "text",
                                cursor: "pointer",
                              }}
                            >
                              {formatTruncatedAddress(
                                swapTransaction.recipient,
                              )}
                            </Box>
                          </CopyTooltip>
                        </P4>
                      </Flex>
                    )} */}
                  </Flex>
                  {/* <Divider color="black" opacity="1" /> */}
                  {/* <Flex flexDirection="column" gap="12px" py="3.5">
                    {transaction.calldata?.map((calldata, cdIndex) => (
                      <Flex key={cdIndex} justifyContent="space-between">
                        <P4 color="neutrals.300" fontWeight="bold">
                          Calldata {cdIndex + 1}
                        </P4>
                        <P4 color="neutrals.400" fontWeight="bold">
                          {number.isHex(calldata) ? (
                            <CopyTooltip
                              copyValue={normalizeAddress(calldata)}
                              prompt=""
                            >
                              <Box
                                _hover={{
                                  bg: "neutrals.700",
                                  color: "text",
                                  cursor: "pointer",
                                }}
                              >
                                {formatTruncatedAddress(calldata)}
                              </Box>
                            </CopyTooltip>
                          ) : (
                            calldata
                          )}
                        </P4>
                      </Flex>
                    ))}
                  </Flex> */}
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  )
}
