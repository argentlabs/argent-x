import { Button, icons } from "@argent/ui"
import { Center, useDisclosure } from "@chakra-ui/react"
import { FC } from "react"

import { ApiTransactionReviewTargettedDapp } from "../../../../../../shared/transactionReview.service"
import { VerifiedDappModal } from "./VerifiedDappModal"

const { VerifiedIcon } = icons

export interface VerifiedDappBannerProps {
  dapp: ApiTransactionReviewTargettedDapp
}

export const VerifiedDappBanner: FC<VerifiedDappBannerProps> = ({ dapp }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Center>
        <Button
          leftIcon={<VerifiedIcon fontSize={"base"} />}
          colorScheme={"success"}
          variant={"outline"}
          size={"auto"}
          fontSize={"2xs"}
          py={1}
          px={2}
          onClick={onOpen}
        >
          Verified
        </Button>
      </Center>
      <VerifiedDappModal dapp={dapp} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
