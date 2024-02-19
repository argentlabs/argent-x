import { icons } from "../../"

const { VerifiedIcon } = icons

import { KnownDappModal } from "./KnownDappModal"
import { Button, useDisclosure } from "@chakra-ui/react"

export const KnownDappButton = ({ dapplandUrl }: { dapplandUrl?: string }) => {
  const {
    isOpen: isKnownDappModalOpen,
    onOpen: onKnownDappModalOpen,
    onClose: onKnownDappModalClose,
  } = useDisclosure()
  return (
    <>
      <Button
        data-testid="KnownDappButton"
        p="1px"
        color="success.500"
        fontSize="sm"
        cursor="pointer"
        onClick={onKnownDappModalOpen}
        variant="unstyled"
        minH={0}
        size="2xs"
      >
        <VerifiedIcon />
      </Button>

      <KnownDappModal
        isOpen={isKnownDappModalOpen}
        onClose={onKnownDappModalClose}
        dapplandUrl={dapplandUrl}
      />
    </>
  )
}
