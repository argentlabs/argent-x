import { Button, Center, Flex, useDisclosure } from "@chakra-ui/react"
import type { FC } from "react"

import { H3, P2 } from "@argent/x-ui"
import { SupportFooter } from "./features/settings/ui/SupportFooter"
import { useClearLocalStorage } from "./features/settings/advanced/clearLocalStorage/useClearLocalStorage"
import { useHardResetAndReload } from "./services/resetAndReload"
import { ClearStorageModal } from "./components/ClearStorageModal"

export const AppBackgroundError: FC = () => {
  const {
    isOpen: isClearStorageModalOpen,
    onOpen: onClearStorageModalOpen,
    onClose: onClearStorageModalClose,
  } = useDisclosure()

  const hardResetAndReload = useHardResetAndReload()
  const onClearStorageSuccess = async () => {
    await hardResetAndReload()
    onClearStorageModalClose()
  }
  const { verifyPasswordAndClearStorage, isClearingStorage } =
    useClearLocalStorage(onClearStorageSuccess)

  return (
    <Flex direction="column" flex={1} p={4}>
      <Center flex={1} flexDirection={"column"} textAlign={"center"} gap={3}>
        <H3>Argent X can’t start</H3>
        <P2 color="neutrals.300">
          Sorry, an error occurred while starting the Argent X background
          process. Accounts are not affected. Please contact support for further
          instructions.
        </P2>
        <Button onClick={onClearStorageModalOpen} mt={2}>
          Clear storage
        </Button>
      </Center>
      <SupportFooter privacyStatement={false} />
      <ClearStorageModal
        isOpen={isClearStorageModalOpen}
        onClose={onClearStorageModalClose}
        onConfirm={verifyPasswordAndClearStorage}
        isClearingStorage={isClearingStorage}
      />
    </Flex>
  )
}
