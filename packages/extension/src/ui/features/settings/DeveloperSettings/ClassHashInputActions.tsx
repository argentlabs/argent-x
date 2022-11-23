import { Button, H6, P4, icons } from "@argent/ui"
import { Box, Flex, ScaleFade } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useRef, useState } from "react"

import { Transaction } from "../../../../shared/transactions"
import { formatTruncatedAddress } from "../../../services/addresses"
import { formatDateTimeBase } from "../../../services/dates"
import type { Account } from "../../accounts/Account"
import { AccountAvatar } from "../../accounts/AccountListItem"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"

const { HistoryIcon, CloseIcon } = icons

interface ClassHashInputActionsProps {
  classHash: string
  onClick: (transaction: Transaction) => void
  reset: () => void
  transactions: Transaction[]
}

const ClassHashInputActions: FC<ClassHashInputActionsProps> = ({
  classHash,
  onClick,
  reset,
  transactions,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { accountNames } = useAccountMetadata()

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!classHash && ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside, true)
    return () => {
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [classHash])

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  return (
    <>
      {!classHash && (
        <Box ref={ref}>
          <Box
            position="absolute"
            top="50%"
            right="12px"
            transform={"translateY(-50%)"}
            zIndex={10}
          >
            <Button
              onClick={handleToggle}
              rounded="full"
              fontSize="2xl"
              color="neutrals.200"
              padding="1.5"
              size="auto"
            >
              <HistoryIcon />
            </Button>
          </Box>
          {isOpen && (
            <Box position="absolute" top="100%" zIndex={100} left="0" right="0">
              <ScaleFade initialScale={0.9} in={isOpen}>
                <Box
                  color="white"
                  bg="neutrals.700"
                  shadow="md"
                  borderBottomRadius="8"
                  maxH="60vh"
                  overflow="auto"
                >
                  <Box>
                    <Box p="4">
                      <H6 p="4" bg="neutrals.600" borderRadius="8" w="85%">
                        Previously declared contracts
                      </H6>
                    </Box>
                  </Box>

                  {transactions.map(
                    (transaction: Transaction, index: number) => (
                      <Flex
                        p="4"
                        _hover={{
                          bg: "neutrals.600",
                          borderBottomRadius:
                            index === transactions.length - 1 ? 8 : 0,
                        }}
                        onClick={() => {
                          handleToggle()
                          onClick(transaction)
                        }}
                        key={transaction.hash}
                        cursor="pointer"
                        data-group
                      >
                        <AccountAvatar
                          src={getNetworkAccountImageUrl({
                            accountName: getAccountName(
                              transaction?.account as Account,
                              accountNames,
                            ),
                            accountAddress: transaction.account.address,
                            networkId: transaction.account.networkId,
                            backgroundColor: undefined,
                          })}
                        />
                        <Flex direction="column" ml="4">
                          <H6>
                            {formatDateTimeBase(transaction.timestamp * 1000)}
                          </H6>
                          <P4
                            color="neutrals.400"
                            mt={1}
                            _groupHover={{ color: "white" }}
                          >
                            {formatTruncatedAddress(
                              transaction.meta?.subTitle || "",
                            )}
                          </P4>
                        </Flex>
                      </Flex>
                    ),
                  )}
                </Box>
              </ScaleFade>
            </Box>
          )}
        </Box>
      )}
      {classHash && (
        <Box
          position="absolute"
          top="50%"
          right="12px"
          transform={"translateY(-50%)"}
          zIndex={10}
        >
          <Button
            color="neutrals.200"
            padding="1.5"
            fontSize="xl"
            size="auto"
            rounded="full"
            onClick={reset}
          >
            <CloseIcon />
          </Button>
        </Box>
      )}
    </>
  )
}

export { ClassHashInputActions }
