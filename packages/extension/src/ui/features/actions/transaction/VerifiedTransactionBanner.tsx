import { P4, icons } from "@argent/ui"
import { Center, Flex, Image } from "@chakra-ui/react"
import { upperFirst } from "lodash-es"
import { FC } from "react"

import { ApiTransactionReviewTargettedDapp } from "../../../../shared/transactionReview.service"

const { VerifiedIcon } = icons

export interface IVerifiedTransactionBanner {
  dapp: ApiTransactionReviewTargettedDapp
}

export const VerifiedTransactionBanner: FC<IVerifiedTransactionBanner> = ({
  dapp,
}) => {
  return (
    <Flex
      w="full"
      backgroundColor="secondaryDark"
      boxShadow="menu"
      borderRadius="xl"
      justifyContent="center"
      alignItems="center"
      gap="2"
      py="2.5"
    >
      <Center>
        <Image src={dapp.iconUrl} w="5" h="5" borderRadius="base" mx="-1" />
        <VerifiedIcon width="18" height="18" color="white" />
      </Center>
      <P4 color="white" fontWeight="bold">
        Verified {upperFirst(dapp.name.toLowerCase())} transaction
      </P4>
    </Flex>
  )
}
