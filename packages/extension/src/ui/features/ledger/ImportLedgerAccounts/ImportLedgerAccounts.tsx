import { FC, useCallback, useMemo, useState } from "react"
import { ScreenLayout } from "../layout/ScreenLayout"
import { Box, Checkbox, Flex, HStack, Tooltip, VStack } from "@chakra-ui/react"
import { P3 } from "@argent/x-ui"
import {
  BaseWalletAccount,
  ImportedLedgerAccount,
} from "../../../../shared/wallet.model"
import { ActionButton } from "../../../components/FullScreenPage"
import { RestoreMultisigSidePanel } from "../RestoreMultisigWithLedger/RestoreMultisigSidePanel"
import { useGetLedgerAccounts } from "../hooks/useGetLedgerAccounts"
import { ImportLedgerAccountsLoading } from "./ImportLedgerAccountsLoading"
import { sortAccountsByDerivationPath } from "../../../../shared/utils/accountsMultisigSort"
import { Pagination } from "./Pagination"
import { ImportLedgerAccountsError } from "./ImportLedgerAccountsError"
import { ledgerService } from "../../../services/ledger"
import { useAccountsOnNetwork } from "../../accounts/accounts.state"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { ampli } from "../../../../shared/analytics"

interface ImportLedgerAccountsProps {
  networkId: string
  currentStep: number
  goNext: () => void
  totalSteps?: number
  filledIndicator?: boolean
  helpLink: string
}

const PAGE_SIZE = 7

export const ImportLedgerAccounts: FC<ImportLedgerAccountsProps> = ({
  networkId,
  currentStep,
  goNext,
  totalSteps,
  filledIndicator,
  helpLink,
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const { accounts, loading, error } = useGetLedgerAccounts(
    networkId,
    pageIndex,
    PAGE_SIZE,
  )

  const allAccounts = useAccountsOnNetwork(networkId)

  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(
    new Set(),
  )

  const isAccountPresent = useCallback(
    (account: BaseWalletAccount) =>
      allAccounts.some((acc) => accountsEqual(acc, account)),
    [allAccounts],
  )

  const onAddAccounts = useCallback(async () => {
    setIsAdding(true)
    try {
      const orderedSelectedAccounts = accounts
        ?.filter((acc) => selectedAccounts.has(acc.address))
        .sort(sortAccountsByDerivationPath)
      if (orderedSelectedAccounts) {
        await ledgerService.addLedgerAccounts(
          orderedSelectedAccounts,
          networkId,
        )

        ampli.ledgerUserAccountAdded({
          "accounts added": orderedSelectedAccounts.length,
          "wallet platform": "browser extension",
        })
      }
      goNext()
    } catch (error) {
      console.error("Error adding ledger accounts", error)
    } finally {
      setIsAdding(false)
    }
  }, [accounts, goNext, networkId, selectedAccounts])

  const handleCheckboxChange = (account: ImportedLedgerAccount) => {
    setSelectedAccounts((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (newSelected.has(account.address)) {
        newSelected.delete(account.address)
      } else {
        newSelected.add(account.address)
      }
      return newSelected
    })
  }

  const actionButtonText = useMemo(() => {
    if (selectedAccounts.size === 0) {
      return "Add account"
    }

    if (selectedAccounts.size === 1) {
      return "Add 1 account"
    }

    return `Add ${selectedAccounts.size} accounts`
  }, [selectedAccounts.size])

  const goToPage = (pageIndex: number) => setPageIndex(pageIndex)

  return (
    <ScreenLayout
      title="Select accounts to add"
      subtitle="Select the accounts which you’d like to add in Argent X"
      currentIndex={currentStep}
      length={totalSteps}
      sidePanel={<RestoreMultisigSidePanel />}
      filledIndicator={filledIndicator}
      helpLink={helpLink}
    >
      <VStack spacing={3} align="stretch" w="full" mt="8" mb="10">
        <Box
          w="full"
          minH={86}
          bg="black"
          border="1px solid"
          borderColor="neutrals.700"
          borderRadius="lg"
          pt={2}
        >
          {loading && <ImportLedgerAccountsLoading />}
          {error && <ImportLedgerAccountsError />}
          {!loading &&
            accounts?.map((acc, i) => (
              <Flex
                key={i}
                py="3.5"
                px="5"
                bgColor="transparent"
                width="full"
                justifyContent="space-between"
                alignItems="center"
              >
                <HStack spacing={4}>
                  <Checkbox
                    as={Box}
                    size="lg"
                    colorScheme="success"
                    iconColor="neutrals.500"
                    iconSize="3.5"
                    isChecked={
                      isAccountPresent(acc) || selectedAccounts.has(acc.address)
                    }
                    onChange={() => handleCheckboxChange(acc)}
                    sx={{
                      "& .chakra-checkbox__control": {
                        color: "neutrals.500",
                        borderRadius: "4px",
                      },
                    }}
                    isDisabled={isAccountPresent(acc)}
                    _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                  />
                  <Tooltip label={acc.address}>
                    <P3 fontWeight="bold" color="white">
                      {`${i + 1 + pageIndex * PAGE_SIZE}. ${acc.address.substring(0, 6)}...${acc.address.substring(acc.address.length - 4)}`}
                    </P3>
                  </Tooltip>
                </HStack>
                {/* <H6 color="neutrals.200">
                  {prettifyCurrencyValue(acc.currencyBalance)}
                </H6> */}
              </Flex>
            ))}
        </Box>
        <Pagination
          goToPage={goToPage}
          currentPageIndex={pageIndex}
          nextPage={() => setPageIndex((p) => p + 1)}
          prevPage={() => setPageIndex((p) => p - 1)}
        />
      </VStack>

      <ActionButton
        onClick={onAddAccounts}
        isDisabled={!selectedAccounts.size}
        isLoading={isAdding}
      >
        {actionButtonText}
      </ActionButton>
    </ScreenLayout>
  )
}
